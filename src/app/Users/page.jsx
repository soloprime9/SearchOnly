'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Users, Search, Calendar, Mail, ArrowUpRight, ShieldCheck, User } from 'lucide-react';
import { getApiBase } from '@/utils/apiConfig';
import { playTap } from '@/utils/soundEffects';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiBase = getApiBase();

        const res = await axios.get(`${apiBase}/user/mango/getall`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load community member directory.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const query = filter.toLowerCase();
    return (
      u.username?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full max-w-5xl mx-auto py-8 sm:py-12 px-3 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2 shadow-sm">
            <Users className="w-3.5 h-3.5" />
            <span>Community Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
            FondPeace Members & Creators
          </h1>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter creators..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-zinc-200 dark:bg-zinc-900/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Error Alert */}
      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Directory Grid */}
      {!loading && !error && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16 bg-white/40 dark:bg-zinc-950/40 rounded-3xl border border-black/5 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-gray-400">No members found matching your filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((u) => {
                const initial = (u.username || u.name || "U")[0].toUpperCase();

                return (
                  <div
                    key={u._id}
                    className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-950/60 backdrop-blur-xl border border-black/[0.06] dark:border-white/[0.08] hover:border-blue-500/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                        {initial}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-gray-950 dark:text-white truncate">
                            {u.username || u.name || "User"}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        </div>
                        {u.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-black/[0.04] dark:border-white/[0.06] text-xs">
                      <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Member"}</span>
                      </span>

                      <Link
                        href={`/profile/${u.username || u._id}`}
                        onClick={() => playTap()}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Profile</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
