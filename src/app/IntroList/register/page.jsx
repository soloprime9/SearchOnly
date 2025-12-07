"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API = "https://gas-back.vercel.app";

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await axios.post(`${API}/register`, {
        username,
        email,
        password,
      });

      alert(res.data.message);

      router.push("/login"); // redirect to login
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-5">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>

      <form onSubmit={handleRegister} className="space-y-3">
        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
    </div>
  );
}
