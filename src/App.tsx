/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  LogOut,
  User,
  Bell,
  Search,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = {
  primaryDark: '#0D1321',
  secondaryDark: '#1D2D44',
  mutedBlue: '#3E5C76',
  steelBlue: '#748CAB',
  cream: '#F0EBD8',
  skyBlue: '#BAE6FD',
};

const API_URL = 'http://127.0.0.1:5001';

interface TicketData {
  id: number;
  user_id?: number;
  title: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Resolved';
  dateSubmitted: string;
  priority: 'Low' | 'Medium' | 'High';
}

interface CurrentUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loginError, setLoginError] = useState('');

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketData | null>(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState('');

  const [formTitle, setFormTitle] = useState('');
  const [formStatus, setFormStatus] = useState<TicketData['status']>('Pending');
  const [formPriority, setFormPriority] = useState<TicketData['priority']>('Medium');

  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      setTicketError('');

      const response = await fetch(`${API_URL}/tickets`);
      if (!response.ok) {
        throw new Error(`Failed to fetch tickets: ${response.status}`);
      }

      const data = await response.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTicketError('Could not load tickets from the backend.');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTickets();
    }
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoginError('');

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setCurrentUser(data.user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setCurrentUser(null);
    setTickets([]);
    setTicketError('');
    setLoginError('');
  };

  const openCreateModal = () => {
    setEditingTicket(null);
    setFormTitle('');
    setFormStatus('Pending');
    setFormPriority('Medium');
    setIsModalOpen(true);
  };

  const openEditModal = (ticket: TicketData) => {
    setEditingTicket(ticket);
    setFormTitle(ticket.title);
    setFormStatus(ticket.status);
    setFormPriority(ticket.priority);
    setIsModalOpen(true);
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setTicketError('');

      if (editingTicket) {
        const response = await fetch(`${API_URL}/tickets/${editingTicket.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formTitle,
            status: formStatus,
            priority: formPriority,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to update ticket');
        }
      } else {
        const response = await fetch(`${API_URL}/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: currentUser?.user_id || 1,
            title: formTitle,
            status: formStatus,
            priority: formPriority,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create ticket');
        }
      }

      setIsModalOpen(false);
      setEditingTicket(null);
      setFormTitle('');
      setFormStatus('Pending');
      setFormPriority('Medium');

      await fetchTickets();
    } catch (error) {
      console.error('Error saving ticket:', error);
      setTicketError(error instanceof Error ? error.message : 'Could not save ticket.');
    }
  };

  const handleDeleteTicket = async (id: number) => {
    try {
      setTicketError('');

      const response = await fetch(`${API_URL}/tickets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete ticket');
      }

      setTickets((prevTickets) => prevTickets.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setTicketError(error instanceof Error ? error.message : 'Could not delete ticket.');
    }
  };

  const unsolvedCount = tickets.filter(
    (ticket) => ticket.status === 'Pending' || ticket.status === 'In Progress'
  ).length;

  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === 'In Progress'
  ).length;

  const completedCount = tickets.filter(
    (ticket) => ticket.status === 'Approved' || ticket.status === 'Resolved'
  ).length;

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: COLORS.primaryDark }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl"
          style={{ backgroundColor: COLORS.secondaryDark }}
        >
          <div className="flex flex-col items-center mb-8">
            <div
              className="p-4 rounded-full mb-4"
              style={{ backgroundColor: COLORS.mutedBlue }}
            >
              <LayoutDashboard size={40} color={COLORS.cream} />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.cream }}>
              Welcome Back
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.steelBlue }}>
              Sign in with your email and password
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.steelBlue }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-all focus:ring-2"
                style={{
                  borderColor: COLORS.steelBlue,
                  color: COLORS.cream,
                }}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.steelBlue }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-all focus:ring-2"
                style={{
                  borderColor: COLORS.steelBlue,
                  color: COLORS.cream,
                }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-lg transition-transform active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: COLORS.cream,
                color: COLORS.primaryDark,
              }}
            >
              Login
            </button>
          </form>

          {loginError && (
            <div className="mt-4 text-sm text-red-400 text-center">
              {loginError}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: COLORS.steelBlue }}>
              Demo login uses your email and last name as password
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ backgroundColor: COLORS.primaryDark }}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.mutedBlue }}>
            <LayoutDashboard size={24} color={COLORS.cream} />
          </div>
          <span className="text-xl font-bold" style={{ color: COLORS.cream }}>
            Nexus Core
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
          <SidebarItem icon={<ClipboardList size={20} />} label="Active Requests" />
          <SidebarItem icon={<User size={20} />} label="Team Members" />
          <SidebarItem icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-4 border-t" style={{ borderColor: COLORS.secondaryDark }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-red-500/10 text-red-400"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ backgroundColor: COLORS.skyBlue }}
      >
        <header className="h-16 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-black/5">
          <h2 className="text-xl font-bold" style={{ color: COLORS.primaryDark }}>
            Tickets Management Dashboard
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2"
                size={18}
                color={COLORS.mutedBlue}
              />
              <input
                type="text"
                placeholder="Search requests..."
                className="pl-10 pr-4 py-2 rounded-full bg-white border border-black/10 text-sm outline-none focus:ring-2 focus:ring-offset-1"
                style={{ color: COLORS.primaryDark }}
              />
            </div>
            <button className="relative p-2 rounded-full hover:bg-black/5 transition-colors">
              <Bell size={20} color={COLORS.primaryDark} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-black/10">
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: COLORS.primaryDark }}>
                  {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Admin User'}
                </p>
                <p className="text-xs" style={{ color: COLORS.mutedBlue }}>
                  Authenticated User
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                {currentUser ? currentUser.first_name[0].toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard label="Tickets Unsolved" value={String(unsolvedCount)} trend={String(unsolvedCount)} />
              <StatCard label="Tickets Being Worked On" value={String(inProgressCount)} trend={String(inProgressCount)} />
              <StatCard label="Completed Tickets" value={String(completedCount)} trend={String(completedCount)} />
              <StatCard label="Total Tickets" value={String(tickets.length)} trend={String(tickets.length)} />
            </div>

            {ticketError && (
              <div className="mb-6 rounded-xl bg-red-100 text-red-700 px-4 py-3 border border-red-200">
                {ticketError}
              </div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-black/5"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center">
                <h3 className="font-bold text-lg" style={{ color: COLORS.primaryDark }}>
                  Recent Activity
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-transform active:scale-95 hover:opacity-90"
                    style={{ backgroundColor: COLORS.mutedBlue, color: COLORS.cream }}
                  >
                    + New Ticket
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-black/10 text-sm font-medium hover:bg-black/5 transition-colors">
                    <Filter size={14} />
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: COLORS.secondaryDark, color: '#FFFFFF' }}>
                      <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Ticket ID</th>
                      <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 font-semibold text-sm uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-black/5">
                    {isLoadingTickets ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm" style={{ color: COLORS.mutedBlue }}>
                          Loading tickets...
                        </td>
                      </tr>
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm" style={{ color: COLORS.mutedBlue }}>
                          No tickets found.
                        </td>
                      </tr>
                    ) : (
                      tickets.map((row) => (
                        <tr key={row.id} className="hover:bg-black/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-mono text-sm font-medium" style={{ color: COLORS.mutedBlue }}>
                            {row.id}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium" style={{ color: COLORS.primaryDark }}>
                            {row.title}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                row.status === 'Approved' || row.status === 'Resolved'
                                  ? 'bg-green-100 text-green-700'
                                  : row.status === 'In Progress'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: COLORS.primaryDark }}>
                            {row.dateSubmitted}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  row.priority === 'High'
                                    ? 'bg-red-500'
                                    : row.priority === 'Medium'
                                    ? 'bg-amber-500'
                                    : 'bg-blue-500'
                                }`}
                              ></div>
                              <span className="text-sm font-medium" style={{ color: COLORS.primaryDark }}>
                                {row.priority}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(row)}
                                className="p-2 rounded-lg hover:bg-black/5 text-blue-600 transition-colors"
                                title="Edit Ticket"
                              >
                                <Settings size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTicket(row.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                title="Delete Ticket"
                              >
                                <LogOut size={16} className="rotate-180" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-black/[0.01] border-t border-black/5 text-center">
                <button
                  onClick={fetchTickets}
                  className="text-sm font-bold hover:underline"
                  style={{ color: COLORS.mutedBlue }}
                >
                  Refresh Requests
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg p-8 rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: COLORS.secondaryDark }}
            >
              <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.cream }}>
                {editingTicket ? 'Edit Ticket' : 'Create New Ticket'}
              </h3>

              <form onSubmit={handleSaveTicket} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                    Ticket Title
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-all focus:ring-2"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                    placeholder="e.g. Broken AC in Unit 302"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as TicketData['status'])}
                      className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-all focus:ring-2"
                      style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                    >
                      <option value="Pending" className="bg-slate-800">Pending</option>
                      <option value="In Progress" className="bg-slate-800">In Progress</option>
                      <option value="Approved" className="bg-slate-800">Approved</option>
                      <option value="Resolved" className="bg-slate-800">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                      Priority
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as TicketData['priority'])}
                      className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none transition-all focus:ring-2"
                      style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                    >
                      <option value="Low" className="bg-slate-800">Low</option>
                      <option value="Medium" className="bg-slate-800">Medium</option>
                      <option value="High" className="bg-slate-800">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-lg font-bold border transition-colors hover:bg-white/5"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.steelBlue }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg font-bold transition-transform active:scale-95 hover:opacity-90"
                    style={{ backgroundColor: COLORS.cream, color: COLORS.primaryDark }}
                  >
                    {editingTicket ? 'Update Ticket' : 'Create Ticket'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active ? 'shadow-lg' : 'hover:bg-white/5'
      }`}
      style={{
        backgroundColor: active ? COLORS.mutedBlue : 'transparent',
        color: active ? COLORS.cream : COLORS.steelBlue,
      }}
    >
      <span style={{ color: active ? COLORS.cream : COLORS.steelBlue }}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend: string;
}) {
  const isPositive = !trend.startsWith('-');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
      <p className="text-sm font-medium mb-1" style={{ color: COLORS.mutedBlue }}>
        {label}
      </p>
      <div className="flex items-end justify-between">
        <h4 className="text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
          {value}
        </h4>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-lg ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}
const response = await fetch(`${API_URL}/tickets/user/${currentUser?.user_id}`);