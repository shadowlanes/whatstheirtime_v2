import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;
const prisma = new PrismaClient();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:8100",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Better Auth handler
app.use("/api/auth", toNodeHandler(auth));

// Healthcheck endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper function to get authenticated user
async function getAuthenticatedUser(req: express.Request) {
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    return session?.user || null;
}

// GET /api/friends - Get all friends for authenticated user
app.get("/api/friends", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const friends = await prisma.friend.findMany({
        where: { userId: user.id },
        orderBy: { order_index: "asc" }
    });

    res.json(friends);
});

// POST /api/friends - Create a new friend
app.post("/api/friends", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, city, timezone_id, country_code } = req.body;

    if (!name || !city || !timezone_id || !country_code) {
        return res.status(400).json({ error: "Missing required fields: name, city, timezone_id, country_code" });
    }

    // Get the highest order_index for this user
    const lastFriend = await prisma.friend.findFirst({
        where: { userId: user.id },
        orderBy: { order_index: "desc" }
    });

    const order_index = lastFriend ? lastFriend.order_index + 1 : 0;

    const friend = await prisma.friend.create({
        data: {
            userId: user.id,
            name,
            city,
            timezone_id,
            country_code,
            order_index
        }
    });

    res.status(201).json(friend);
});

// PUT /api/friends/:id - Update a friend
app.put("/api/friends/:id", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const { name, city, timezone_id, country_code } = req.body;

    // Verify the friend belongs to this user
    const existingFriend = await prisma.friend.findFirst({
        where: { id, userId: user.id }
    });

    if (!existingFriend) {
        return res.status(404).json({ error: "Friend not found" });
    }

    const friend = await prisma.friend.update({
        where: { id },
        data: {
            name: name ?? existingFriend.name,
            city: city ?? existingFriend.city,
            timezone_id: timezone_id ?? existingFriend.timezone_id,
            country_code: country_code ?? existingFriend.country_code
        }
    });

    res.json(friend);
});

// PATCH /api/friends/reorder - Reorder friends
app.patch("/api/friends/reorder", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const updates: Array<{ id: string; order_index: number }> = req.body;

    if (!Array.isArray(updates)) {
        return res.status(400).json({ error: "Request body must be an array of { id, order_index }" });
    }

    // Verify all friends belong to this user and update them
    await prisma.$transaction(
        updates.map(({ id, order_index }) =>
            prisma.friend.updateMany({
                where: { id, userId: user.id },
                data: { order_index }
            })
        )
    );

    res.json({ success: true });
});

// DELETE /api/friends/:id - Delete a friend
app.delete("/api/friends/:id", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;

    // Verify the friend belongs to this user
    const existingFriend = await prisma.friend.findFirst({
        where: { id, userId: user.id }
    });

    if (!existingFriend) {
        return res.status(404).json({ error: "Friend not found" });
    }

    await prisma.friend.delete({ where: { id } });

    res.status(204).send();
});

// GET /api/user/location - Get user's location
app.get("/api/user/location", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { city: true, timezone_id: true, country_code: true }
    });

    res.json({
        city: userData?.city || null,
        timezone_id: userData?.timezone_id || null,
        country_code: userData?.country_code || null
    });
});

// PUT /api/user/location - Update user's location
app.put("/api/user/location", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { city, timezone_id, country_code } = req.body;

    // Validate: either all fields or all null
    const hasAllFields = city && timezone_id && country_code;
    const hasNoFields = !city && !timezone_id && !country_code;

    if (!hasAllFields && !hasNoFields) {
        return res.status(400).json({
            error: "Must provide all location fields or none to clear"
        });
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            city: city || null,
            timezone_id: timezone_id || null,
            country_code: country_code || null
        },
        select: { city: true, timezone_id: true, country_code: true }
    });

    res.json(updatedUser);
});

// Example protected route
app.get("/api/protected", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ message: "Hello from protected route!", user: session.user });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
