import { useSession, signIn, signOut } from "./lib/auth-client";
import { Dashboard } from "./components/Dashboard";
import { Globe, Clock, Users, Sparkles } from "lucide-react";
import { Button } from "./components/ui/button";

function App() {
    const { data: session, isPending } = useSession();

    if (isPending) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Authenticated: show dashboard
    if (session) {
        return <Dashboard user={session.user} onSignOut={() => signOut()} />;
    }

    // Not authenticated: show landing page
    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-500" />

            <div className="relative flex flex-col items-center justify-center min-h-screen p-6">
                <div className="max-w-lg w-full space-y-8 text-center">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl blur-lg opacity-50" />
                            <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 p-4 rounded-2xl">
                                <Globe className="h-12 w-12 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* App Name */}
                    <div>
                        <h1 className="text-5xl font-extrabold tracking-tight">
                            <span className="gradient-text">whats their time</span>
                        </h1>
                        <p className="mt-4 text-xl text-muted-foreground font-medium">
                            Track time for your friends across the world
                        </p>
                    </div>

                    {/* Feature cards */}
                    <div className="grid grid-cols-3 gap-4 py-8">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-purple-100 border border-purple-100">
                            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center mb-3">
                                <Globe className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">Global Coverage</p>
                            <p className="text-xs text-muted-foreground mt-1">280+ cities worldwide</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-purple-100 border border-purple-100">
                            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center mb-3">
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">Live Updates</p>
                            <p className="text-xs text-muted-foreground mt-1">Real-time sync</p>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-purple-100 border border-purple-100">
                            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-foreground">Work Status</p>
                            <p className="text-xs text-muted-foreground mt-1">9-6 detection</p>
                        </div>
                    </div>

                    {/* Sign in button */}
                    <div className="space-y-4">
                        <Button
                            onClick={() => signIn.social({ provider: "google" })}
                            className="w-full py-6 text-lg gap-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-200 font-semibold"
                            size="lg"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Continue with Google
                        </Button>

                        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Free forever. No credit card needed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
