'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Calendar, Flag, CheckCircle, Clock, 
  Trash2, ChevronDown, ChevronUp, Bell, ListTodo 
} from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = "https://backend-k.vercel.app/api/reminders";
const MOCK_USER_ID = "65f123abc456def789"; // Replace with real Auth ID

function App() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    checklist: []
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/${MOCK_USER_ID}`);
      setReminders(res.data.data);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching data", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_BASE, { ...formData, userId: MOCK_USER_ID });
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium', checklist: [] });
      setShowForm(false);
      fetchReminders();
    } catch (err) { alert("Error saving reminder"); }
  };

  const toggleChecklistItem = async (reminderId, itemId, isCompleted) => {
    try {
      await axios.patch(`${API_BASE}/${reminderId}/checklist`, { itemId, isCompleted: !isCompleted });
      fetchReminders();
    } catch (err) { console.error(err); }
  };

  const handleSnooze = async (id) => {
    try {
      await axios.patch(`${API_BASE}/${id}/snooze`, { minutes: 15 });
      fetchReminders();
    } catch (err) { console.error(err); }
  };

  const markComplete = async (id) => {
    try {
      await axios.put(`${API_BASE}/${id}/complete`);
      fetchReminders();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Bell className="text-indigo-600" /> RemindPro <span className="text-sm bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">v2.0</span>
          </h1>
          <p className="text-slate-500">You have {reminders.length} pending tasks</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          {showForm ? <ChevronUp /> : <Plus />} New Reminder
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form (Visible on toggle) */}
        {showForm && (
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-4">Create Reminder</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Task Title" required
                className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <textarea 
                placeholder="Description (optional)"
                className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">DUE DATE</label>
                <input 
                  type="datetime-local" required
                  className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">PRIORITY</label>
                <select 
                  className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <button className="w-full bg-slate-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-colors">
                Save Reminder
              </button>
            </form>
          </div>
        )}

        {/* Right Column: List */}
        <div className={showForm ? "lg:col-span-2" : "lg:col-span-3"}>
          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading your schedule...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reminders.map(item => (
                <ReminderCard 
                  key={item._id} 
                  data={item} 
                  onCheck={toggleChecklistItem}
                  onSnooze={handleSnooze}
                  onComplete={markComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual Reminder Cards
function ReminderCard({ data, onCheck, onSnooze, onComplete }) {
  const priorityColors = {
    low: 'bg-emerald-500',
    medium: 'bg-amber-500',
    high: 'bg-orange-500',
    critical: 'bg-red-600'
  };

  const progress = data.checklist.length > 0 
    ? (data.checklist.filter(c => c.isCompleted).length / data.checklist.length) * 100 
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1.5 ${priorityColors[data.scheduling.priority]}`} />
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded text-white ${priorityColors[data.scheduling.priority]}`}>
            {data.scheduling.priority}
          </span>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock size={14} />
            {format(new Date(data.scheduling.dueDate), 'MMM d, h:mm a')}
          </div>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1">{data.title}</h3>
        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{data.description}</p>

        {/* Checklist Progress */}
        {data.checklist.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>CHECKLIST PROGRESS</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full">
              <div className="bg-indigo-500 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 space-y-1">
              {data.checklist.map(task => (
                <div key={task._id} className="flex items-center gap-2 text-xs text-slate-600">
                  <input 
                    type="checkbox" checked={task.isCompleted} 
                    onChange={() => onCheck(data._id, task._id, task.isCompleted)}
                    className="rounded text-indigo-600" 
                  />
                  <span className={task.isCompleted ? 'line-through opacity-50' : ''}>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-slate-50">
          <button 
            onClick={() => onComplete(data._id)}
            className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} /> Complete
          </button>
          <button 
            onClick={() => onSnooze(data._id)}
            className="bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100"
          >
            Snooze
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
