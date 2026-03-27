"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setLoading(true);
    try {
      await userApi.post("/update/user", { name: name.trim() });
      await fetchUser();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="mb-4 text-xl font-bold">Profile</h1>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border px-3 py-2"
      />
      <button
        onClick={save}
        disabled={loading}
        className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-white"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </main>
  );
}
