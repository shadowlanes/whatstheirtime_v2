-- CreateTable
CREATE TABLE "weather" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "temperature" INTEGER NOT NULL,
    "weatherCode" INTEGER NOT NULL,
    "aqi" INTEGER,
    "pm10" DOUBLE PRECISION,
    "pm25" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weather_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weather_city_key" ON "weather"("city");

-- CreateIndex
CREATE INDEX "weather_city_idx" ON "weather"("city");

-- CreateIndex
CREATE INDEX "weather_lastUpdated_idx" ON "weather"("lastUpdated");
