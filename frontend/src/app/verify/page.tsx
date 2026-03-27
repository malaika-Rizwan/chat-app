"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setToken } = useAuth();
  const email = useMemo(() => params.get("email") || "", [params]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const submit = async () => {
    const code = otp.join("");
    if (!email || code.length !== 6) {
      return toast.error("Please enter full OTP");
    }
    setLoading(true);
    try {
      const { data } = await userApi.post("/verify", { email, otp: code });
      const token = data.token as string;
      setToken(token);
      toast.success("Logged in");
      router.push("/chat");
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const focusIndex = (idx: number) => {
    inputRefs.current[idx]?.focus();
  };

  const setOtpAt = (idx: number, value: string) => {
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
  };

  const handlePaste = (idx: number, pasted: string) => {
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    if (!digits) return;

    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = digits[i] ?? "";
    }
    setOtp(next);

    const lastFilled = Math.min(digits.length - 1, 5);
    focusIndex(Math.max(lastFilled, idx));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-1 text-xl font-bold">Verify OTP</h1>
        <p className="mb-4 text-sm text-gray-500">{email}</p>
        <div className="mb-4 flex gap-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              maxLength={1}
              value={digit}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length > 1) {
                  handlePaste(idx, val);
                  return;
                }
                setOtpAt(idx, val);
                if (val && idx < 5) focusIndex(idx + 1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace") {
                  if (otp[idx]) {
                    setOtpAt(idx, "");
                  } else if (idx > 0) {
                    focusIndex(idx - 1);
                    setOtpAt(idx - 1, "");
                  }
                }
                if (e.key === "Enter") void submit();
              }}
              onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text");
                handlePaste(idx, text);
              }}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              inputMode="numeric"
              autoComplete={idx === 0 ? "one-time-code" : "off"}
              className="h-11 w-11 rounded-lg border text-center text-lg outline-none focus:ring-2 focus:ring-emerald-400"
            />
          ))}
        </div>
        <button
          onClick={submit}
          disabled={loading}
          className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<main className="p-6 text-center">Loading...</main>}>
      <VerifyContent />
    </Suspense>
  );
}
