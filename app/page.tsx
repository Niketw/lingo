"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";

export default function AuthPage() {
  const [mode, setMode] = useState<"Login" | "Signup">("Login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();
  const setAuth = useUserStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode.toLowerCase() === "login" ? "login" : "register",
          username,
          password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setAuth(data.id, data.username);
      router.push("/onboarding");
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-20">
      <h2 className="text-primary font-extrabold text-4xl mb-2 text-center mt-8">
        Language Buddy
      </h2>
      <p className="text-gray-400 font-bold text-center mb-8">
        {mode === "Login" ? "Sign in to save progress" : "Create your account to start learning!"}
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        {error && <div className="text-danger text-center font-bold">{error}</div>}
        
        <input
          className="w-full bg-card text-white px-4 py-4 rounded-2xl border-2 border-border font-bold focus:border-tertiary focus:outline-none transition-colors"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full bg-card text-white px-4 py-4 rounded-2xl border-2 border-border font-bold focus:border-tertiary focus:outline-none transition-colors"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="text-center my-2 transition-all">
          {mode === "Login" ? (
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setMode("Signup")}
            >
              Don't have an account? Sign up
            </Button>
          ) : (
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setMode("Login")}
            >
              Already have an account? Login
            </Button>
          )}
        </div>

        <Button type="submit" variant="default">
          {mode === "Login" ? "LOGIN" : "CREATE ACCOUNT"}
        </Button>
      </form>
    </div>
  );
}
