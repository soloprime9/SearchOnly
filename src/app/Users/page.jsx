'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ✅ Get token from localStorage or cookies
        const token = localStorage.getItem('token');

        const res = await axios.get("https://backend-k.vercel.app/user/mango/getall", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUsers(res.data);
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p className="text-center">Loading users...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Users</h2>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border">#</th>
              <th className="py-2 px-4 border">Name</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id} className="text-center">
                <td className="py-2 px-4 border">{i + 1}</td>
                <td className="py-2 px-4 border">{u.username}</td>
                <td className="py-2 px-4 border">{u.email}</td>
                <td className="py-2 px-4 border">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
