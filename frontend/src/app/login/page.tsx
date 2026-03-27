"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { userApi } from "@/lib/api";
import type { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) return toast.error("Email is required");
    setLoading(true);
    try {
      await userApi.post("/login", { email });
      toast.success("OTP sent successfully");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-cyan-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h1 className="mb-1 text-2xl font-bold">Welcome Back</h1>
        <p className="mb-5 text-sm text-gray-500">Enter your email to get OTP</p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </main>
  );
}
