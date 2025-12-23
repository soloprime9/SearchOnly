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

  const API = "https://list-back-nine.vercel.app";

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
      router.push("/JobTension/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
        
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
          Create Account
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Join us and start your journey 🚀
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a strong password"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/JobTension/login")}
            className="text-indigo-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}











// "use client";
// import { useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// export default function RegisterPage() {
//   const router = useRouter();

//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const API = "https://list-back-nine.vercel.app";

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);

//       const res = await axios.post(`${API}/register`, {
//         username,
//         email,
//         password,
//       });

//       alert(res.data.message);

//       router.push("/JobTension/login"); // redirect to login
//     } catch (err) {
//       alert(err.response?.data?.message || "Registration failed");
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="max-w-md mx-auto p-5">
//       <h2 className="text-2xl font-bold mb-4">Create Account</h2>

//       <form onSubmit={handleRegister} className="space-y-3">
//         <input
//           type="text"
//           placeholder="Username"
//           className="w-full border p-2 rounded"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//         />

//         <input
//           type="email"
//           placeholder="Email"
//           className="w-full border p-2 rounded"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="w-full border p-2 rounded"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//         >
//           {loading ? "Creating..." : "Register"}
//         </button>
//       </form>
//     </div>
//   );
// }
