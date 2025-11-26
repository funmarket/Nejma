"use client";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-[9999]">
      <div className="text-center">
        <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-primary via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Welcome to NEJMA
        </h1>
        <p className="text-muted-foreground">Discover the next big thing in talent!</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mt-6"></div>
      </div>
    </div>
  );
}
