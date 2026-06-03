import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, Clock, Plus, LogOut, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = "https://backend-k.vercel.app/api/reminders";

function App() {
  const [user, setUser] = useState(null); // The logged-in user
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

  // 1. Check if user is already logged in on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("remindUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchReminders(parsedUser._id);
    }
  }, []);

  const fetchReminders = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/user/${userId}`);
      setReminders(res.data.data);
    } catch (err) { console.error("Fetch error"); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      localStorage.setItem("remindUser", JSON.stringify(res.data));
      setUser(res.data);
      fetchReminders(res.data._id);
    } catch (err) { alert("Login Failed!"); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      const res = await axios.post(`${API_BASE}/signup`, { name, email, password });
      alert("Account created! Now login.");
    } catch (err) { alert("Signup Failed!"); }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    const payload = {
      userId: user._id, // Using the real ID from login
      title: formData.title,
      description: formData.description,
      scheduling: { 
        dueDate: new Date(formData.dueDate).toISOString(), 
        priority: formData.priority 
      }
    };
    try {
      await axios.post(`${API_BASE}`, payload);
      setShowForm(false);
      fetchReminders(user._id);
    } catch (err) { alert("Error saving"); }
  };

  const logout = () => {
    localStorage.removeItem("remindUser");
    setUser(null);
  };

  // --- UI Logic ---
  if (!user) {
    return (
      <AuthScreen onLogin={handleLogin} onSignup={handleSignup} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="max-w-5xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white"><Bell /></div>
          <h1 className="text-2xl font-black">RemindPro</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase">Welcome back</p>
            <p className="font-bold text-slate-700">{user.name}</p>
          </div>
          <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut /></button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold">Your Schedule ({reminders.length})</h2>
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-indigo-100">+ Add New</button>
        </div>

        {/* Form and List go here (Same as before but using handleCreateReminder) */}
        {/* ... Card and Mapping Logic ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reminders.map(rem => (
                <div key={rem._id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
                    <div className="flex justify-between mb-4">
                        <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            {rem.scheduling.priority}
                        </span>
                        <Clock size={16} className="text-slate-300"/>
                    </div>
                    <h3 className="font-bold text-lg">{rem.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{rem.description}</p>
                    <p className="text-xs font-black text-slate-900">{format(new Date(rem.scheduling.dueDate), 'PPp')}</p>
                </div>
            ))}
        </div>
      </main>
      
      {/* Reminder Form Modal would go here */}
    </div>
  );
}

// Simple Auth UI Component
function AuthScreen({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-black mb-2 text-slate-800">{isLogin ? "Welcome Back" : "Join RemindPro"}</h2>
        <p className="text-slate-400 mb-8 font-medium">{isLogin ? "Log in to manage your tasks" : "Create your free account today"}</p>
        
        <form onSubmit={isLogin ? onLogin : onSignup} className="space-y-4">
          {!isLogin && <input name="name" placeholder="Full Name" required className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500" />}
          <input name="email" type="email" placeholder="Email Address" required className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500" />
          <input name="password" type="password" placeholder="Password" required className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500" />
          <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black shadow-xl hover:bg-slate-900 transition-all">
            {isLogin ? "LOG IN" : "CREATE ACCOUNT"}
          </button>
        </form>
        
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm font-bold text-indigo-600 hover:underline">
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}

export default App;
