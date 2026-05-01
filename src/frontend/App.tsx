/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Smart Campus — Staff / Admin Dashboard
 * 7-section nav: Home · Housing · Maintenance · Account Mgmt · Building · Access Control · Academics
 */

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Home,
  Building2,
  Wrench,
  Users,
  ShieldCheck,
  GraduationCap,
  LogOut,
  User,
  Plus,
  Settings,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── palette (unchanged from original) ───────────────────────────────────────
const C = {
  primaryDark:   '#0D1321',
  secondaryDark: '#1D2D44',
  mutedBlue:     '#3E5C76',
  steelBlue:     '#748CAB',
  cream:         '#F0EBD8',
  skyBlue:       '#BAE6FD',
  sidebarBg:     '#3251B0', // matches the screenshot's sidebar colour
};

const API_URL = 'http://127.0.0.1:5002';
const apiFetch = (input: RequestInfo | URL, init: RequestInit = {}) =>
  fetch(input, { credentials: 'include', ...init });

const MOCK_USERS: CurrentUser[] = [
  { user_id: 1, first_name: 'Nora', last_name: 'Admin', email: 'admin@campus.demo', department: 'Admin' },
  { user_id: 2, first_name: 'Ian', last_name: 'IT', email: 'it@campus.demo', department: 'IT' },
  { user_id: 3, first_name: 'Holly', last_name: 'Housing', email: 'housing@campus.demo', department: 'Housing' },
  { user_id: 4, first_name: 'Mason', last_name: 'Maintenance', email: 'maintenance@campus.demo', department: 'Maintenance' },
  { user_id: 5, first_name: 'Priya', last_name: 'Provost', email: 'provost@campus.demo', department: 'Provost' },
];

const MOCK_TICKETS: TicketData[] = [
  { id: 101, user_id: 1, title: 'AC outage in Building C, Floor 2', status: 'In Progress', dateSubmitted: '2026-04-20', priority: 'High', department: 'Maintenance', assignee: 'Mike Carter', actionNotes: 'Technician dispatched. Compressor inspection in progress.' },
  { id: 102, user_id: 3, title: 'Dorm key card replacement request', status: 'Pending', dateSubmitted: '2026-04-21', priority: 'Medium', department: 'Housing', assignee: 'Sara Lane', actionNotes: 'Waiting for student ID verification.' },
  { id: 103, user_id: 5, title: 'Senate agenda upload for spring term', status: 'Resolved', dateSubmitted: '2026-04-18', priority: 'Low', department: 'Provost', assignee: 'Priya N.', actionNotes: 'Agenda and attachments posted to portal.' },
  { id: 104, user_id: 2, title: 'Library card reader not responding', status: 'Approved', dateSubmitted: '2026-04-17', priority: 'Low', department: 'IT', assignee: 'Ian T.', actionNotes: 'Firmware updated and rebooted.' },
];

const ROOM_DIRECTORY: RoomData[] = [
  {
    building: 'Science Hall',
    room: '214',
    capacity: 42,
    schedule: [
      { day: 'Monday', time: '09:00 - 10:30', course: 'BIO 201', instructor: 'Dr. Patel' },
      { day: 'Wednesday', time: '09:00 - 10:30', course: 'BIO 201', instructor: 'Dr. Patel' },
      { day: 'Friday', time: '13:00 - 14:30', course: 'CHEM 110', instructor: 'Prof. Lee' },
    ],
  },
  {
    building: 'Engineering Center',
    room: 'B105',
    capacity: 60,
    schedule: [
      { day: 'Tuesday', time: '10:00 - 11:30', course: 'EE 310', instructor: 'Dr. Gomez' },
      { day: 'Thursday', time: '10:00 - 11:30', course: 'EE 310', instructor: 'Dr. Gomez' },
    ],
  },
  {
    building: 'Liberal Arts',
    room: '301',
    capacity: 35,
    schedule: [
      { day: 'Monday', time: '11:00 - 12:30', course: 'HIST 221', instructor: 'Dr. Nguyen' },
      { day: 'Wednesday', time: '11:00 - 12:30', course: 'HIST 221', instructor: 'Dr. Nguyen' },
      { day: 'Thursday', time: '15:00 - 16:30', course: 'PHIL 105', instructor: 'Prof. Ross' },
    ],
  },
];

const MOCK_HOUSING_REQUESTS: HousingRequestData[] = [
  { id: 1, student_id: 'S001', first_name: 'Alice', last_name: 'Johnson', email: 'alice@campus.edu', current_dorm: 'East Hall', requested_dorm: 'West Hall', status: 'Pending', priority: 'Medium' },
  { id: 2, student_id: 'S002', first_name: 'Bob', last_name: 'Smith', email: 'bob@campus.edu', current_dorm: 'North Hall', requested_dorm: 'South Hall', status: 'Approved', priority: 'High' },
  { id: 3, student_id: 'S003', first_name: 'Carol', last_name: 'White', email: 'carol@campus.edu', current_dorm: 'East Hall', requested_dorm: 'North Hall', status: 'In Progress', priority: 'Low' },
  { id: 4, student_id: 'S004', first_name: 'Diana', last_name: 'Brown', email: 'diana@campus.edu', current_dorm: 'West Hall', requested_dorm: 'East Hall', status: 'Pending', priority: 'Medium' },
];

const MOCK_BEDS: BedData[] = [
  { id: 101, dorm: 'East Hall', room_number: '101', bed_number: 'A', occupant: 'John Doe', status: 'Occupied' },
  { id: 102, dorm: 'East Hall', room_number: '101', bed_number: 'B', occupant: null, status: 'Available' },
  { id: 103, dorm: 'West Hall', room_number: '205', bed_number: 'A', occupant: 'Sarah Lee', status: 'Occupied' },
  { id: 104, dorm: 'West Hall', room_number: '205', bed_number: 'B', occupant: null, status: 'Available' },
  { id: 105, dorm: 'North Hall', room_number: '310', bed_number: 'A', occupant: 'Mike Chen', status: 'Occupied' },
  { id: 106, dorm: 'North Hall', room_number: '310', bed_number: 'B', occupant: 'Emma Davis', status: 'Occupied' },
  { id: 107, dorm: 'South Hall', room_number: '415', bed_number: 'A', occupant: null, status: 'Available' },
  { id: 108, dorm: 'South Hall', room_number: '415', bed_number: 'B', occupant: null, status: 'Available' },
];

const MOCK_LOST_ID_CARDS: LostCardData[] = [
  { user_id: 1001, card_id: 501, card_number: '1001', reported_date: '04-28-2026', status: 'Open', replacement_requested: true, notes: 'Student report card missing after leaving dorm.' },
  { user_id: 1002, card_id: 502, card_number: '1002', reported_date: '04-29-2026', status: 'Under Review', replacement_requested: true, notes: 'Card was reported missing near the library.' },
  { user_id: 1003, card_id: 503, card_number: '1003', reported_date: '04-30-2026', status: 'Resolved', replacement_requested: false, notes: 'Card found in lost and found.' },
  { user_id: 1004, card_id: 504, card_number: '1004', reported_date: '05-01-2026', status: 'Closed', replacement_requested: true, notes: 'Replacement issued.' },
];

const MOCK_ACCESS_LOGS: AccessLogData[] = [
  { log_id: 1, user_id: 1001, student_name: 'Jane Smith', access_type: 'Keycard Swipe', location: 'North Hall Entrance', time: '04-30-2026 08:15 AM', result: 'Granted' },
  { log_id: 2, user_id: 1002, student_name: 'Michael Johnson', access_type: 'Login', location: 'Student Portal', time: '04-30-2026 09:05 AM', result: 'Success' },
  { log_id: 3, user_id: 1003, student_name: 'Emily Davis', access_type: 'Keycard Swipe', location: 'Science Building Door 2', time: '04-30-2026 10:20 AM', result: 'Denied' },
  { log_id: 4, user_id: 1001, student_name: 'Jane Smith', access_type: 'Keycard Swipe', location: 'Library Main Door', time: '04-30-2026 10:45 AM', result: 'Granted' },
  { log_id: 5, user_id: 1004, student_name: 'Robert Wilson', access_type: 'Keycard Swipe', location: 'Dormitory Main Gate', time: '04-30-2026 11:30 AM', result: 'Granted' },
];

// ─── types ────────────────────────────────────────────────────────────────────
interface CurrentUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  department?: string;
  role?: string;
}

interface TicketData {
  id: number;
  user_id?: number;
  department?: string;
  assignee?: string;
  actionNotes?: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Resolved';
  dateSubmitted: string;
  priority: 'Low' | 'Medium' | 'High';
  building?: string;
  room?: string;
}

interface RoomScheduleItem {
  day: string;
  time: string;
  course: string;
  instructor: string;
}

interface RoomData {
  building: string;
  room: string;
  capacity: number;
  schedule: RoomScheduleItem[];
}

interface HousingRequestData {
  id: number;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  current_dorm: string;
  requested_dorm: string;
  status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected';
  priority: 'Low' | 'Medium' | 'High';
}

interface BedData {
  id: number;
  dorm: string;
  room_number: string;
  bed_number: string;
  occupant: string | null;
  status: 'Occupied' | 'Available' | 'Maintenance';
}

interface LostCardData {
  user_id: number;
  card_id: number;
  card_number: string;
  reported_date: string;
  status: 'Open' | 'Under Review' | 'Resolved' | 'Closed';
  replacement_requested: boolean;
  notes: string;
}

interface AccessLogData {
  log_id: number;
  user_id: number;
  student_name: string;
  access_type: string;
  location: string;
  time: string;
  result: 'Granted' | 'Denied' | 'Success' | 'Failed';
}

type Section =
  | 'home'
  | 'housing'
  | 'maintenance'
  | 'accounts'
  | 'buildings'
  | 'access'
  | 'academics'
  | 'password';

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'home',        label: 'Home',                icon: <Home size={18} /> },
  { id: 'housing',     label: 'Housing Management',  icon: <Building2 size={18} /> },
  { id: 'maintenance', label: 'Maintenance',         icon: <Wrench size={18} /> },
  { id: 'accounts',    label: 'Account Management',  icon: <Users size={18} /> },
  { id: 'buildings',   label: 'Building Management', icon: <LayoutDashboard size={18} /> },
  { id: 'access',      label: 'Access Control',      icon: <ShieldCheck size={18} /> },
  { id: 'academics',   label: 'Academic',            icon: <GraduationCap size={18} /> },
];

const ALL_SECTIONS: Section[] = NAV_ITEMS.map(item => item.id);

const ROLE_SECTION_ACCESS: Record<string, Section[]> = {
  Admin: ALL_SECTIONS,
  IT: ALL_SECTIONS,
  Housing: ['housing'],
  Maintenance: ['maintenance'],
  Provost: ['academics'],
  'Housing Staff': ['housing'],
  'Maintenance Staff': ['maintenance'],
  'Provost Staff': ['academics'],
};

const getRoleSections = (role?: string): Section[] => {
  if (!role) return ALL_SECTIONS;
  if (role === 'faculty') return ['home', 'academics'];
  return ROLE_SECTION_ACCESS[role] ?? ['home'];
};

const getCurrentDepartment = (user: CurrentUser | null): string =>
  user?.department ?? user?.role ?? '';

const canDepartmentSeeTicket = (department: string, ticket: TicketData): boolean => {
  if (department === 'Admin' || department === 'IT') return true;
  return ticket.department === department;
};

const normalizeDepartment = (value?: string): string =>
  (value || '').trim().toLowerCase();

const isFacilitiesStaff = (user: Pick<CurrentUser, 'department' | 'role'>): boolean => {
  const dept = normalizeDepartment(user.department ?? user.role);
  return dept === 'facilities management' || dept === 'maintenance' || dept === 'maintenance staff';
};

const toDisplayName = (user: Partial<CurrentUser> & { name?: string }): string => {
  const fromParts = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  if (fromParts) return fromParts;
  return (user.name || user.email || '').trim();
};

const getDormFromDepartment = (department?: string): string => {
  const dept = (department || '').toLowerCase();
  if (dept.includes('east')) return 'East Hall';
  if (dept.includes('west')) return 'West Hall';
  if (dept.includes('north')) return 'North Hall';
  if (dept.includes('south')) return 'South Hall';
  return '';
};

// ─── root component ───────────────────────────────────────────────────────────
export default function App({ onBackToPortal }: { onBackToPortal?: () => void }) {
  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [authPassword,  setAuthPassword]  = useState('');
  const [currentUser,   setCurrentUser]   = useState<CurrentUser | null>(null);
  const [users,         setUsers]         = useState<CurrentUser[]>([]);
  const [rooms,         setRooms]         = useState<RoomData[]>([]);
  const [loginError,    setLoginError]    = useState('');
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ticket state (used by Home + Maintenance)
  const [tickets,          setTickets]          = useState<TicketData[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketError,      setTicketError]      = useState('');
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [editingTicket,    setEditingTicket]    = useState<TicketData | null>(null);
  const [selectedRoom,     setSelectedRoom]     = useState<RoomData | null>(null);
  const [formTitle,        setFormTitle]        = useState('');
  const [formStatus,       setFormStatus]       = useState<TicketData['status']>('Pending');
  const [formPriority,     setFormPriority]     = useState<TicketData['priority']>('Medium');
  const [formAssignee,     setFormAssignee]     = useState('');
  const [formActionNotes,  setFormActionNotes]  = useState('');
  const [formBuilding,     setFormBuilding]     = useState('');
  const [formRoom,         setFormRoom]         = useState('');
  // Note: Location type fields kept for future dorm support
  // const [formLocationType, setFormLocationType] = useState<'building' | 'dorm'>('building');
  // const [formDorm,         setFormDorm]         = useState('');
  // const [formDormRoom,     setFormDormRoom]     = useState('');
  const [maintenanceStaff, setMaintenanceStaff] = useState<string[]>([]);
  const [staffError,       setStaffError]       = useState('');
  const [lostCards,        setLostCards]        = useState<LostCardData[]>([]);
  const [isLoadingCards,   setIsLoadingCards]   = useState(false);
  const [cardError,        setCardError]        = useState('');
  const [accessLogs,       setAccessLogs]       = useState<AccessLogData[]>([]);
  const [isLoadingLogs,    setIsLoadingLogs]    = useState(false);
  const [logsError,        setLogsError]        = useState('');
  const [accessTab,        setAccessTab]        = useState<'logs' | 'cards'>('logs');

  const currentDepartment = getCurrentDepartment(currentUser);
  const allowedSections: Section[] = currentUser?.role === 'faculty'
    ? ['home', 'academics']
    : getRoleSections(currentDepartment);
  const visibleNavItems = NAV_ITEMS.filter(item => allowedSections.includes(item.id));
  const assigneeOptions = Array.from(new Set([
    ...(formAssignee ? [formAssignee] : []),
    ...maintenanceStaff,
  ]));

  // ── ticket helpers ────────────────────────────────────────────────────────
  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      setTicketError('');
      const res = await apiFetch(`${API_URL}/tickets`);
      if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.status}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      setTicketError('Could not load tickets from the backend.');
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const fetchMaintenanceStaff = async () => {
    const parseNames = (payload: unknown): string[] => {
      const rows = Array.isArray(payload)
        ? payload
        : (payload && typeof payload === 'object' && Array.isArray((payload as { users?: unknown[] }).users)
          ? (payload as { users: unknown[] }).users
          : []);

      return rows
        .map(row => {
          if (!row || typeof row !== 'object') return '';
          return toDisplayName(row as Partial<CurrentUser> & { name?: string });
        })
        .filter(Boolean);
    };

    try {
      setStaffError('');
      const scopedRes = await apiFetch(`${API_URL}/users?department=${encodeURIComponent('Facilities Management')}`);
      if (scopedRes.ok) {
        const scopedData = await scopedRes.json().catch(() => ([]));
        const scopedNames = Array.from(new Set(parseNames(scopedData)));
        if (scopedNames.length > 0) {
          setMaintenanceStaff(scopedNames);
          return;
        }
      }

      const allRes = await apiFetch(`${API_URL}/users`);
      if (!allRes.ok) throw new Error('Could not fetch users.');
      const allData = await allRes.json().catch(() => ([]));
      const allRows = Array.isArray(allData)
        ? allData
        : (allData && typeof allData === 'object' && Array.isArray((allData as { users?: unknown[] }).users)
          ? (allData as { users: unknown[] }).users
          : []);

      const facilityNames = Array.from(new Set(allRows
        .filter(row => row && typeof row === 'object' && isFacilitiesStaff(row as Pick<CurrentUser, 'department' | 'role'>))
        .map(row => toDisplayName(row as Partial<CurrentUser> & { name?: string }))
        .filter(Boolean)));

      setMaintenanceStaff(facilityNames);
    } catch (err) {
      setStaffError('Could not load Facilities Management staff.');
      setMaintenanceStaff([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiFetch(`${API_URL}/retrieve-users`);
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers(currentUser ? [currentUser] : []);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await apiFetch(`${API_URL}/get-rooms`);
      if (!res.ok) throw new Error(`Failed to fetch rooms: ${res.status}`);
      const data = await res.json();
      const mappedRooms = (Array.isArray(data) ? data : []).reduce<RoomData[]>((acc, row) => {
        if (!row || typeof row !== 'object') return acc;
        const building = String((row as { building?: string }).building || '').trim();
        const room = String((row as { room?: string }).room || '').trim();
        if (!building || !room) return acc;
        acc.push({
          building,
          room,
          capacity: Number((row as { capacity?: number }).capacity || 0),
          schedule: [],
        });
        return acc;
      }, []);
      setRooms(mappedRooms);
    } catch {
      setRooms([]);
    }
  };

  const fetchLostCards = async () => {
    try {
      setIsLoadingCards(true);
      setCardError('');
      const res = await apiFetch(`${API_URL}/lost_id_cards`);
      if (!res.ok) throw new Error(`Failed to fetch lost cards: ${res.status}`);
      const data = await res.json();
      setLostCards(Array.isArray(data) ? data : []);
    } catch (err) {
      setCardError('Could not load lost ID cards from the backend.');
    } finally {
      setIsLoadingCards(false);
    }
  };

  const fetchAccessLogs = async () => {
    try {
      setIsLoadingLogs(true);
      setLogsError('');
      const res = await apiFetch(`${API_URL}/access_logs`);
      if (!res.ok) throw new Error(`Failed to fetch access logs: ${res.status}`);
      const data = await res.json();
      setAccessLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setLogsError('Could not load access logs from the backend.');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => { if (isLoggedIn) fetchTickets(); }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) fetchMaintenanceStaff();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) fetchLostCards();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) fetchAccessLogs();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) fetchUsers();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) fetchRooms();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && activeSection !== 'password' && !allowedSections.includes(activeSection)) {
      setActiveSection(allowedSections[0] || 'home');
    }
  }, [isLoggedIn, allowedSections, activeSection]);

  const handleChangePassword = async (currentPassword: string, nextPassword: string, confirmPassword: string) => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !nextPassword || !confirmPassword) {
      setPasswordError('Please complete all password fields.');
      return;
    }
    if (nextPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (nextPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      const res = await apiFetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.user_id,
          current_password: currentPassword,
          new_password: nextPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Password update failed');

      setAuthPassword(nextPassword);
      setPasswordSuccess('Password changed successfully.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openCreateModal = () => {
    setEditingTicket(null); setFormTitle('');
    setFormStatus('Pending'); setFormPriority('Medium');
    setFormAssignee(''); setFormActionNotes('');
    setFormBuilding(''); setFormRoom('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: TicketData) => {
    setEditingTicket(t); setFormTitle(t.title);
    setFormStatus(t.status); setFormPriority(t.priority);
    setFormAssignee(t.assignee || ''); setFormActionNotes(t.actionNotes || '');
    setFormBuilding(t.building || ''); setFormRoom(t.room || '');
    setIsModalOpen(true);
  };

  const handleRoomLookup = (building: string, roomQuery: string): boolean => {
    const normalizedRoom = roomQuery.trim().toLowerCase();
    if (!building || !normalizedRoom) return false;

    const found = rooms.find(r => (
      r.building === building && r.room.toLowerCase() === normalizedRoom
    ));

    if (!found) return false;
    setSelectedRoom(found);
    setActiveSection('buildings');
    return true;
  };

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formBuilding || !formRoom) {
      setTicketError('Please select both building and room.');
      return;
    }

    try {
      setTicketError('');
      if (editingTicket) {
        const res = await apiFetch(`${API_URL}/tickets/${editingTicket.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            status: formStatus,
            priority: formPriority,
            assignee: formAssignee,
            action_notes: formActionNotes,
            building: formBuilding,
            room: formRoom,
          }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Update failed');
      } else {
        const res = await apiFetch(`${API_URL}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: currentUser?.user_id || 1,
            title: formTitle,
            status: formStatus,
            priority: formPriority,
            assignee: formAssignee,
            action_notes: formActionNotes,
            building: formBuilding,
            room: formRoom,
          }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Create failed');
      }
      setIsModalOpen(false); setEditingTicket(null);
      setFormTitle(''); setFormStatus('Pending'); setFormPriority('Medium');
      setFormAssignee(''); setFormActionNotes('');
      setFormBuilding(''); setFormRoom('');
      await fetchTickets();
    } catch (err) {
      setTicketError(err instanceof Error ? err.message : 'Could not save ticket.');
    }
  };

  const handleDeleteTicket = async (id: number) => {
    try {
      setTicketError('');
      const res = await apiFetch(`${API_URL}/tickets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Delete failed');
      setTickets(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setTicketError(err instanceof Error ? err.message : 'Could not delete ticket.');
    }
  };

  // ── auth ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoginError('');
      const res = await apiFetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const normalizedUser: CurrentUser = {
        ...data.user,
        department: data.user?.department ?? data.user?.role,
        role: data.role ?? data.user?.role,
      };
      setCurrentUser(normalizedUser);
      setUsers([normalizedUser]);
      setIsLoggedIn(true);
      setAuthPassword(password);
      setActiveSection(getRoleSections(getCurrentDepartment(normalizedUser))[0] || 'home');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = () => {
    void apiFetch(`${API_URL}/logout`, { method: 'POST' });
    setIsLoggedIn(false); setEmail(''); setPassword('');
    setAuthPassword('');
    setCurrentUser(null); setUsers([]); setRooms([]); setTickets([]); setTicketError(''); setLoginError('');
    setPasswordError(''); setPasswordSuccess('');
    setActiveSection('home');
    if (onBackToPortal) {
      onBackToPortal();
    }
  };

  // ── derived ticket counts ─────────────────────────────────────────────────
  const visibleTickets = tickets.filter(t => canDepartmentSeeTicket(currentDepartment, t));
  const unsolvedCount   = visibleTickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const inProgressCount = visibleTickets.filter(t => t.status === 'In Progress').length;
  const completedCount  = visibleTickets.filter(t => t.status === 'Approved' || t.status === 'Resolved').length;

  // ── login screen ──────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: C.primaryDark }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-2xl shadow-2xl"
          style={{ backgroundColor: C.secondaryDark }}
        >
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 rounded-full mb-4" style={{ backgroundColor: C.mutedBlue }}>
              <LayoutDashboard size={40} color={C.cream} />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: C.cream }}>Welcome Back</h1>
            <p className="text-sm mt-2" style={{ color: C.steelBlue }}>
              Smart Campus — Staff Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="p-3 rounded-lg border" style={{ borderColor: C.steelBlue }}>
              <label className="flex items-center justify-between gap-3 text-sm" style={{ color: C.cream }}>
                <span>Backend authentication</span>
              </label>
              <p className="text-xs mt-1" style={{ color: C.steelBlue }}>
                Sign in against the live backend API.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.steelBlue }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                style={{ borderColor: C.steelBlue, color: C.cream }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: C.steelBlue }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                style={{ borderColor: C.steelBlue, color: C.cream }}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-lg transition-transform active:scale-95 hover:opacity-90"
              style={{ backgroundColor: C.cream, color: C.primaryDark }}
            >
              Sign In
            </button>
          </form>

          {loginError && <p className="mt-4 text-sm text-red-400 text-center">{loginError}</p>}
          <p className="mt-8 text-center text-sm" style={{ color: C.steelBlue }}>
            Live mode: authenticates against the backend /login route.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── section renderer ──────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return (
          <HomeSection
            tickets={visibleTickets}
            rooms={rooms}
            unsolvedCount={unsolvedCount}
            inProgressCount={inProgressCount}
            completedCount={completedCount}
            isLoading={isLoadingTickets}
            error={ticketError}
            onRefresh={fetchTickets}
            onNewTicket={openCreateModal}
            onRoomLookup={handleRoomLookup}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceSection
            tickets={visibleTickets}
            isLoading={isLoadingTickets}
            error={ticketError}
            onNew={openCreateModal}
            onEdit={openEditModal}
            onDelete={handleDeleteTicket}
            onRefresh={fetchTickets}
          />
        );
      case 'housing':
        return (
          <HousingManagementSection
            requests={[]}
            beds={[]}
            currentUser={currentUser}
          />
        );
      case 'accounts':
        return (
          <AccountManagementSection
            users={users}
          />
        );
      case 'buildings':
        return (
          <BuildingManagementSection
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
          />
        );
      case 'access':
        return (
          <AccessControlSection
            lostCards={lostCards}
            isLoadingCards={isLoadingCards}
            cardError={cardError}
            accessLogs={accessLogs}
            isLoadingLogs={isLoadingLogs}
            logsError={logsError}
            activeTab={accessTab}
            onTabChange={setAccessTab}
          />
        );
      case 'academics':
        return (
          <AcademicsSection
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={setSelectedRoom}
          />
        );
      case 'password':
        return (
          <PasswordSection
            isSaving={isChangingPassword}
            error={passwordError}
            success={passwordSuccess}
            onSubmit={handleChangePassword}
          />
        );
      default:            return null;
    }
  };

  // ── main layout ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: C.primaryDark }}>

      {/* Top bar */}
      <header
        className="h-16 flex items-center justify-between px-6 flex-shrink-0"
        style={{ backgroundColor: C.sidebarBg }}
      >
        <div className="flex items-center gap-3">
          <LayoutDashboard size={22} color={C.cream} />
          <span className="text-lg font-bold tracking-wide" style={{ color: C.cream }}>
            Smart Campus
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm" style={{ color: C.cream }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: C.mutedBlue, color: C.cream }}
            title={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : ''}
          >
            {currentUser ? currentUser.first_name[0].toUpperCase() : <User size={16} />}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside
          className="w-56 flex-shrink-0 flex flex-col py-4"
          style={{ backgroundColor: C.sidebarBg }}
        >
          <nav className="flex-1 space-y-1 px-3">
            {visibleNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                style={{
                  backgroundColor: activeSection === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: activeSection === item.id ? C.cream : 'rgba(240,235,216,0.7)',
                  fontWeight: activeSection === item.id ? 700 : 500,
                }}
              >
                <span style={{ opacity: activeSection === item.id ? 1 : 0.65 }}>{item.icon}</span>
                <span className="text-sm leading-tight">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-3 pt-1">
            <button
              onClick={() => setActiveSection('password')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-150"
              style={{
                backgroundColor: activeSection === 'password' ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeSection === 'password' ? C.cream : 'rgba(240,235,216,0.7)',
                fontWeight: activeSection === 'password' ? 700 : 500,
              }}
            >
              <Settings size={16} />
              <span className="text-sm leading-tight">Settings</span>
            </button>
          </div>

          {/* User + logout */}
          <div className="px-3 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            <div className="px-4 py-2 mb-2">
              <p className="text-xs font-bold truncate" style={{ color: C.cream }}>
                {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(240,235,216,0.6)' }}>
                {currentUser?.email ?? ''}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(240,235,216,0.6)' }}>
                Department: {currentDepartment || 'Unknown'}
              </p>
            </div>
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="w-full flex items-center gap-3 px-4 py-2.5 mb-2 rounded-xl transition-colors hover:bg-blue-500/20 text-blue-300 text-sm font-medium"
              >
                <ChevronRight size={16} className="rotate-180" />
                Back to portal selection
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors hover:bg-red-500/20 text-red-300 text-sm font-medium"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-auto" style={{ backgroundColor: '#f0f2f5' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Ticket modal (shared across Home + Maintenance) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-lg p-8 rounded-2xl shadow-2xl"
              style={{ backgroundColor: C.secondaryDark }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: C.cream }}>
                  {editingTicket ? 'Edit Ticket' : 'New Maintenance Ticket'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} style={{ color: C.steelBlue }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTicket} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>Building</label>
                    <select
                      value={formBuilding}
                      onChange={e => {
                        setFormBuilding(e.target.value);
                        setFormRoom('');
                      }}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                      style={{ borderColor: C.steelBlue, color: C.cream }}
                    >
                      <option value="" className="bg-slate-800">Select building</option>
                      {Array.from(new Set(ROOM_DIRECTORY.map(r => r.building))).map(building => (
                        <option key={building} value={building} className="bg-slate-800">{building}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>Room</label>
                    <select
                      value={formRoom}
                      onChange={e => setFormRoom(e.target.value)}
                      required
                      disabled={!formBuilding}
                      className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none disabled:opacity-50"
                      style={{ borderColor: C.steelBlue, color: C.cream }}
                    >
                      <option value="" className="bg-slate-800">Select room</option>
                      {ROOM_DIRECTORY.filter(r => r.building === formBuilding).map(room => (
                        <option key={`${room.building}-${room.room}`} value={room.room} className="bg-slate-800">{room.room}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>Title</label>
                  <input
                    type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} required
                    placeholder="e.g. Broken AC in Building C"
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: C.steelBlue, color: C.cream }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>Status</label>
                    <select
                      value={formStatus} onChange={e => setFormStatus(e.target.value as TicketData['status'])}
                      className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                      style={{ borderColor: C.steelBlue, color: C.cream }}
                    >
                      <option value="Pending" className="bg-slate-800">Pending</option>
                      <option value="In Progress" className="bg-slate-800">In Progress</option>
                      <option value="Approved" className="bg-slate-800">Approved</option>
                      <option value="Resolved" className="bg-slate-800">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>Priority</label>
                    <select
                      value={formPriority} onChange={e => setFormPriority(e.target.value as TicketData['priority'])}
                      className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                      style={{ borderColor: C.steelBlue, color: C.cream }}
                    >
                      <option value="Low" className="bg-slate-800">Low</option>
                      <option value="Medium" className="bg-slate-800">Medium</option>
                      <option value="High" className="bg-slate-800">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>Assignee</label>
                  <select
                    value={formAssignee}
                    onChange={e => setFormAssignee(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: C.steelBlue, color: C.cream }}
                  >
                    <option value="" className="bg-slate-800">Unassigned</option>
                    {assigneeOptions.map(name => (
                      <option key={name} value={name} className="bg-slate-800">{name}</option>
                    ))}
                  </select>
                  {staffError && <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{staffError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>Action Notes</label>
                  <textarea
                    value={formActionNotes}
                    onChange={e => setFormActionNotes(e.target.value)}
                    placeholder="Add updates taken on this ticket"
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none resize-none"
                    style={{ borderColor: C.steelBlue, color: C.cream }}
                  />
                </div>

                {ticketError && <p className="text-sm text-red-400">{ticketError}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button" onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-lg font-bold border"
                    style={{ borderColor: C.steelBlue, color: C.steelBlue }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-transform"
                    style={{ backgroundColor: C.cream, color: C.primaryDark }}
                  >
                    {editingTicket ? 'Save Changes' : 'Create Ticket'}
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

// ─── Home section ─────────────────────────────────────────────────────────────
function HomeSection({
  tickets, rooms, unsolvedCount, inProgressCount, completedCount,
  isLoading, error, onRefresh, onNewTicket, onRoomLookup,
}: {
  tickets: TicketData[];
  rooms: RoomData[];
  unsolvedCount: number; inProgressCount: number; completedCount: number;
  isLoading: boolean; error: string;
  onRefresh: () => void; onNewTicket: () => void;
  onRoomLookup: (building: string, roomQuery: string) => boolean;
}) {
  const buildingOptions = Array.from(new Set(rooms.map(r => r.building)));
  const [selectedBuilding, setSelectedBuilding] = useState(buildingOptions[0] || '');
  const [roomQuery, setRoomQuery] = useState('');
  const [lookupError, setLookupError] = useState('');

  const submitRoomLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const found = onRoomLookup(selectedBuilding, roomQuery);
    if (!found) {
      setLookupError('Room not found for the selected building.');
      return;
    }
    setLookupError('');
    setRoomQuery('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Dashboard Overview</h2>
        <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>
          Live snapshot of campus operations
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Open Tickets"       value={String(unsolvedCount)}   accent="#EF4444" />
        <StatCard label="In Progress"        value={String(inProgressCount)} accent="#F59E0B" />
        <StatCard label="Completed"          value={String(completedCount)}  accent="#10B981" />
        <StatCard label="Total Tickets"      value={String(tickets.length)}  accent={C.mutedBlue} />
      </div>

      {/* Quick action row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <h3 className="font-bold text-base mb-3" style={{ color: C.primaryDark }}>
            New Maintenance Report
          </h3>
          <p className="text-sm mb-4" style={{ color: C.mutedBlue }}>
            File a new maintenance ticket for any campus facility issue.
          </p>
          <button
            onClick={onNewTicket}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-opacity hover:opacity-80"
            style={{ backgroundColor: C.sidebarBg, color: C.cream }}
          >
            <Plus size={15} /> Create Ticket
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <h3 className="font-bold text-base mb-3" style={{ color: C.primaryDark }}>
            Room Schedule Lookup
          </h3>
          <p className="text-sm mb-4" style={{ color: C.mutedBlue }}>
            Select a building, then search for a room to open its schedule.
          </p>
          <form onSubmit={submitRoomLookup} className="space-y-3">
            <select
              value={selectedBuilding}
              onChange={e => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            >
              {buildingOptions.map(building => (
                <option key={building} value={building}>{building}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomQuery}
                onChange={e => setRoomQuery(e.target.value)}
                placeholder="e.g. 214 or B105"
                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: C.steelBlue, color: C.primaryDark }}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={{ backgroundColor: C.mutedBlue, color: C.cream }}
              >
                Search
              </button>
            </div>
            {lookupError && <p className="text-xs text-red-600">{lookupError}</p>}
          </form>
        </div>
      </div>

      {/* Recent tickets preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <h3 className="font-bold" style={{ color: C.primaryDark }}>Recent Tickets</h3>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 text-xs font-bold hover:underline"
            style={{ color: C.mutedBlue }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        {error && <div className="mx-5 mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</div>}
        <TicketTable
          tickets={tickets.slice(0, 5)}
          isLoading={isLoading}
          onEdit={() => {}}
          onDelete={() => {}}
          readOnly
        />
      </div>
    </div>
  );
}

// ─── Maintenance section ──────────────────────────────────────────────────────
function MaintenanceSection({
  tickets, isLoading, error, onNew, onEdit, onDelete, onRefresh,
}: {
  tickets: TicketData[];
  isLoading: boolean; error: string;
  onNew: () => void;
  onEdit: (t: TicketData) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
}) {
  const [ticketSearch, setTicketSearch] = useState('');
  const normalizedQuery = ticketSearch.trim().toLowerCase();

  const filteredTickets = normalizedQuery
    ? tickets.filter(t => {
        const searchable = [
          String(t.id),
          t.title,
          t.status,
          t.priority,
          t.assignee || '',
          t.actionNotes || '',
          t.department || '',
        ].join(' ').toLowerCase();
        return searchable.includes(normalizedQuery);
      })
    : tickets;

  const openCount = tickets.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const completedCount = tickets.filter(t => t.status === 'Approved' || t.status === 'Resolved').length;
  const totalCount = tickets.length;

  const byAssignee = tickets.reduce<Record<string, number>>((acc, ticket) => {
    const person = (ticket.assignee || 'Unassigned').trim() || 'Unassigned';
    acc[person] = (acc[person] || 0) + 1;
    return acc;
  }, {});

  const assigneeChartRows = Object.entries(byAssignee).sort((a, b) => b[1] - a[1]);
  const maxTicketCount = assigneeChartRows[0]?.[1] || 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Maintenance</h2>
          <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>
            Manage all campus maintenance tickets
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium hover:bg-black/5"
            style={{ borderColor: C.steelBlue, color: C.mutedBlue }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90"
            style={{ backgroundColor: C.sidebarBg, color: C.cream }}
          >
            <Plus size={15} /> New Ticket
          </button>
        </div>
      </div>

      {error && <div className="mb-5 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <StatCard label="Open Tickets" value={String(openCount)} accent="#EF4444" />
        <StatCard label="In Progress" value={String(inProgressCount)} accent="#F59E0B" />
        <StatCard label="Completed" value={String(completedCount)} accent="#10B981" />
        <StatCard label="Total Tickets" value={String(totalCount)} accent={C.mutedBlue} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-4 border-b border-black/5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} style={{ color: C.mutedBlue }} />
            <span className="text-sm font-medium" style={{ color: C.mutedBlue }}>
              {filteredTickets.length} of {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="sm:ml-auto w-full sm:w-80 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.steelBlue }} />
            <input
              type="text"
              value={ticketSearch}
              onChange={e => setTicketSearch(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            />
          </div>
        </div>
        <TicketTable
          tickets={filteredTickets}
          isLoading={isLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          clickableRows
        />
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5">
          <h3 className="font-bold" style={{ color: C.primaryDark }}>Tickets by Assignee</h3>
          <p className="text-xs mt-1" style={{ color: C.mutedBlue }}>
            Number of maintenance tickets currently assigned to each person.
          </p>
        </div>

        <div className="p-5 space-y-3">
          {assigneeChartRows.length === 0 ? (
            <p className="text-sm" style={{ color: C.mutedBlue }}>No ticket data available.</p>
          ) : (
            assigneeChartRows.map(([person, count]) => (
              <div key={person} className="grid grid-cols-[180px_1fr_auto] items-center gap-3">
                <p className="text-sm truncate" style={{ color: C.primaryDark }}>{person}</p>
                <div className="h-7 rounded-md overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                  <div
                    className="h-full rounded-md"
                    style={{
                      width: `${maxTicketCount > 0 ? (count / maxTicketCount) * 100 : 0}%`,
                      backgroundColor: C.sidebarBg,
                    }}
                  />
                </div>
                <p className="text-sm font-semibold" style={{ color: C.primaryDark }}>{count}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Housing management section ───────────────────────────────────────────────
function HousingManagementSection({
  requests,
  beds,
  currentUser,
}: {
  requests: HousingRequestData[];
  beds: BedData[];
  currentUser: CurrentUser | null;
}) {
  const userDorm = getDormFromDepartment(currentUser?.department);
  const isHousingStaff = currentUser?.department?.toLowerCase().includes('housing') ?? false;

  const filteredRequests = isHousingStaff && userDorm
    ? requests.filter(r => r.current_dorm === userDorm || r.requested_dorm === userDorm)
    : requests;

  const pendingRequests = filteredRequests.filter(r => r.status === 'Pending').length;
  const inProgressRequests = filteredRequests.filter(r => r.status === 'In Progress').length;
  const approvedRequests = filteredRequests.filter(r => r.status === 'Approved').length;
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;

  const dormNames = Array.from(new Set(beds.map(b => b.dorm)));
  const maintenanceEventCount = filteredRequests.filter(r => r.status === 'In Progress').length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Housing Management</h2>
        <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>
          Manage dorms, rooms, and student housing contracts.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard label="Current Housing Request" value={String(pendingRequests)} accent="#3B82F6" />
        <StatCard label="Number of Beds" value={String(totalBeds)} accent="#10B981" />
        <StatCard label="Number of Occupied Beds" value={String(occupiedBeds)} accent="#F59E0B" />
        <StatCard label="Current Maintenance Events" value={String(maintenanceEventCount)} accent="#EF4444" />
      </div>

      {/* Main content panels */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Current Maintenance Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5">
            <h3 className="font-bold" style={{ color: C.primaryDark }}>Current Maintenance Requests</h3>
            <p className="text-xs mt-1" style={{ color: C.mutedBlue }}>
              Housing-related maintenance in dormitories
            </p>
          </div>
          <div className="p-6 min-h-40 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-sm" style={{ color: C.mutedBlue }}>
              {maintenanceEventCount > 0
                ? `${maintenanceEventCount} maintenance event${maintenanceEventCount !== 1 ? 's' : ''} in progress`
                : 'No active maintenance events'}
            </p>
          </div>
        </div>

        {/* Current Beds Available */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5">
            <h3 className="font-bold" style={{ color: C.primaryDark }}>Current Beds Available</h3>
            <p className="text-xs mt-1" style={{ color: C.mutedBlue }}>
              Available beds across all dormitories: {availableBeds} of {totalBeds}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {dormNames.map(dorm => {
                const dormBeds = beds.filter(b => b.dorm === dorm);
                const dormAvailable = dormBeds.filter(b => b.status === 'Available').length;
                const dormOccupied = dormBeds.filter(b => b.status === 'Occupied').length;
                return (
                  <div key={dorm} className="grid grid-cols-[140px_1fr_auto_auto] items-center gap-4">
                    <p className="text-sm font-medium" style={{ color: C.primaryDark }}>{dorm}</p>
                    <div className="h-6 rounded-md overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                      <div
                        className="h-full rounded-md"
                        style={{
                          width: `${dormOccupied > 0 ? (dormOccupied / dormBeds.length) * 100 : 0}%`,
                          backgroundColor: C.sidebarBg,
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: C.primaryDark }}>
                      {dormAvailable}
                    </p>
                    <p className="text-xs" style={{ color: C.mutedBlue }}>
                      available
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Housing Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="p-5 border-b border-black/5">
            <h3 className="font-bold" style={{ color: C.primaryDark }}>Current Housing Requests</h3>
            <p className="text-xs mt-1" style={{ color: C.mutedBlue }}>
              Pending: {pendingRequests} | In Progress: {inProgressRequests} | Approved: {approvedRequests}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: C.secondaryDark, color: '#fff' }}>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Current Dorm</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Requested Dorm</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: C.mutedBlue }}>
                      No housing requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="px-5 py-4 text-sm font-medium" style={{ color: C.primaryDark }}>
                        {req.first_name} {req.last_name}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>
                        {req.current_dorm}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>
                        {req.requested_dorm}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          req.status === 'Approved'
                            ? 'bg-green-100 text-green-700'
                            : req.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : req.status === 'Rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>{req.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 text-sm font-medium`} style={{ color: C.primaryDark }}>
                          <span className={`w-2 h-2 rounded-full ${
                            req.priority === 'High' ? 'bg-red-500' : req.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-400'
                          }`} />
                          {req.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          className="px-4 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: C.sidebarBg, color: C.cream }}
        >
          LOOK UP STUDENT HOUSING
        </button>
        <button
          className="px-4 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: C.mutedBlue, color: C.cream }}
        >
          CREATE MAINTENANCE REQUEST
        </button>
        <button
          className="px-4 py-3 rounded-lg font-bold text-sm transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#10B981', color: C.cream }}
        >
          MODIFY HOUSING ASSIGNMENT
        </button>
      </div>
    </div>
  );
}

// ─── Building management section ─────────────────────────────────────────────
function BuildingManagementSection({
  rooms,
  selectedRoom,
  onSelectRoom,
}: {
  rooms: RoomData[];
  selectedRoom: RoomData | null;
  onSelectRoom: (room: RoomData | null) => void;
}) {
  const buildingOptions = Array.from(new Set(rooms.map(r => r.building)));
  const [building, setBuilding] = useState(selectedRoom?.building || buildingOptions[0] || '');
  const roomOptions = rooms.filter(r => r.building === building);

  useEffect(() => {
    if (!buildingOptions.includes(building)) {
      setBuilding(buildingOptions[0] || '');
    }
  }, [building, buildingOptions]);

  useEffect(() => {
    if (selectedRoom) {
      setBuilding(selectedRoom.building);
    }
  }, [selectedRoom]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Building Management</h2>
        <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>
          Room scheduling and classroom availability
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.mutedBlue }}>Building</label>
            <select
              value={building}
              onChange={e => {
                setBuilding(e.target.value);
                onSelectRoom(null);
              }}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            >
              {buildingOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.mutedBlue }}>Room</label>
            <select
              value={selectedRoom?.room || ''}
              onChange={e => {
                const room = roomOptions.find(r => r.room === e.target.value) || null;
                onSelectRoom(room);
              }}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            >
              <option value="">Select room</option>
              {roomOptions.map(room => (
                <option key={`${room.building}-${room.room}`} value={room.room}>{room.room}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm" style={{ color: C.mutedBlue }}>
              Capacity: <span className="font-semibold" style={{ color: C.primaryDark }}>{selectedRoom?.capacity ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/5">
          <h3 className="font-bold" style={{ color: C.primaryDark }}>
            {selectedRoom ? `Schedule for ${selectedRoom.building} ${selectedRoom.room}` : 'Room Schedule'}
          </h3>
        </div>

        {!selectedRoom ? (
          <div className="p-6 text-sm" style={{ color: C.mutedBlue }}>
            Select a room to view its schedule.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: C.secondaryDark, color: '#fff' }}>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Day</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Course</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {selectedRoom.schedule.map((slot, idx) => (
                  <tr key={`${slot.day}-${slot.time}-${idx}`} className="hover:bg-black/[0.02]">
                    <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>{slot.day}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>{slot.time}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>{slot.course}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>{slot.instructor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Account management section ──────────────────────────────────────────────
function AccountManagementSection({ users }: { users: CurrentUser[] }) {
  const [localUsers, setLocalUsers] = useState<CurrentUser[]>(users);
  const [departments, setDepartments] = useState<string[]>(() => {
    const initial = users.map(u => u.department || u.role || '').filter(Boolean);
    return Array.from(new Set(initial));
  });
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedUserForDepartment, setSelectedUserForDepartment] = useState<CurrentUser | null>(null);
  const [departmentDraft, setDepartmentDraft] = useState('');
  const [newDepartmentDraft, setNewDepartmentDraft] = useState('');
  const [departmentNotice, setDepartmentNotice] = useState('');
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<CurrentUser | null>(null);
  const [passwordDraft, setPasswordDraft] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [userPasswords, setUserPasswords] = useState<Record<number, string>>({});

  useEffect(() => {
    setLocalUsers(users);
    const incoming = users.map(u => u.department || u.role || '').filter(Boolean);
    setDepartments(prev => Array.from(new Set([...prev, ...incoming])));
  }, [users]);

  const applyUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchInput.trim().toLowerCase());
  };

  const filteredUsers = activeQuery
    ? localUsers.filter(u => {
        const searchable = [
          String(u.user_id),
          `${u.first_name} ${u.last_name}`,
          u.email,
          u.department || u.role || '',
        ].join(' ').toLowerCase();
        return searchable.includes(activeQuery);
      })
    : localUsers;

  const openDepartmentModal = (user: CurrentUser) => {
    setSelectedUserForDepartment(user);
    setDepartmentDraft(user.department || user.role || departments[0] || '');
    setNewDepartmentDraft('');
    setDepartmentNotice('');
  };

  const closeDepartmentModal = () => {
    setSelectedUserForDepartment(null);
    setDepartmentDraft('');
    setNewDepartmentDraft('');
    setDepartmentNotice('');
  };

  const addDepartmentOption = () => {
    const next = newDepartmentDraft.trim();
    if (!next) return;
    setDepartments(prev => {
      if (prev.includes(next)) return prev;
      return [...prev, next];
    });
    setDepartmentDraft(next);
    setNewDepartmentDraft('');
  };

  const saveAssignedDepartment = async () => {
    if (!selectedUserForDepartment) return;
    if (!departmentDraft.trim()) {
      setDepartmentNotice('Please choose or add a department.');
      return;
    }

    try {
      setDepartmentNotice('');
      const res = await apiFetch(`${API_URL}/update-department`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserForDepartment.user_id,
          new_department: departmentDraft.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not update department');

      setLocalUsers(prev => prev.map(u => (
        u.user_id === selectedUserForDepartment.user_id
          ? { ...u, department: departmentDraft.trim() }
          : u
      )));
      setDepartments(prev => (prev.includes(departmentDraft.trim()) ? prev : [...prev, departmentDraft.trim()]));
      closeDepartmentModal();
    } catch (err) {
      setDepartmentNotice(err instanceof Error ? err.message : 'Could not update department.');
    }
  };

  const openPasswordModal = (user: CurrentUser) => {
    setSelectedUserForPassword(user);
    setPasswordDraft(user.last_name);
    setPasswordNotice('');
  };

  const closePasswordModal = () => {
    setSelectedUserForPassword(null);
    setPasswordDraft('');
  };

  const resetToLastName = () => {
    if (!selectedUserForPassword) return;
    setPasswordDraft(selectedUserForPassword.last_name);
    setPasswordNotice(`Password reset to last name: ${selectedUserForPassword.last_name}`);
  };

  const saveUserPassword = async () => {
    if (!selectedUserForPassword) return;
    if (!passwordDraft.trim()) {
      setPasswordNotice('Password cannot be empty.');
      return;
    }

    try {
      setPasswordNotice('');
      const res = await apiFetch(`${API_URL}/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUserForPassword.user_id,
          new_password: passwordDraft,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not update password');

      setUserPasswords(prev => ({
        ...prev,
        [selectedUserForPassword.user_id]: passwordDraft,
      }));
      setPasswordNotice('Password updated successfully.');
      closePasswordModal();
    } catch (err) {
      setPasswordNotice(err instanceof Error ? err.message : 'Could not update password.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Account Management</h2>
        <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>
          Create and manage user accounts, assign departments, reset passwords.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-black/5">
          <form onSubmit={applyUserSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search users by ID, name, email, or department"
              className="flex-1 px-4 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg text-sm font-bold"
              style={{ backgroundColor: C.mutedBlue, color: C.cream }}
            >
              Search Users
            </button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ backgroundColor: C.secondaryDark, color: '#fff' }}>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Department</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: C.mutedBlue }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.user_id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-5 py-4 text-sm font-mono" style={{ color: C.mutedBlue }}>
                      #{u.user_id}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium" style={{ color: C.primaryDark }}>
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>
                      {u.email}
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>
                      {u.department || u.role || 'Unassigned'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ backgroundColor: C.sidebarBg, color: C.cream }}
                          onClick={() => openDepartmentModal(u)}
                        >
                          Assign Department
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold"
                          style={{ backgroundColor: C.mutedBlue, color: C.cream }}
                          onClick={() => openPasswordModal(u)}
                        >
                          Set Password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUserForDepartment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={closeDepartmentModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{ backgroundColor: C.secondaryDark }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: C.cream }}>
                  Assign Department
                </h3>
                <button onClick={closeDepartmentModal} style={{ color: C.steelBlue }}>
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm mb-4" style={{ color: C.steelBlue }}>
                User: {selectedUserForDepartment.first_name} {selectedUserForDepartment.last_name}
              </p>

              <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>
                Department
              </label>
              <select
                value={departmentDraft}
                onChange={e => setDepartmentDraft(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                style={{ borderColor: C.steelBlue, color: C.cream }}
              >
                {departments.map(dep => (
                  <option key={dep} value={dep} className="bg-slate-800">{dep}</option>
                ))}
              </select>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>
                  Add New Department
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDepartmentDraft}
                    onChange={e => setNewDepartmentDraft(e.target.value)}
                    placeholder="e.g. Registrar"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: C.steelBlue, color: C.cream }}
                  />
                  <button
                    type="button"
                    onClick={addDepartmentOption}
                    className="px-3 py-2.5 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: C.mutedBlue, color: C.cream }}
                  >
                    Add
                  </button>
                </div>
              </div>

              {departmentNotice && (
                <p className="text-xs mt-3" style={{ color: '#fca5a5' }}>
                  {departmentNotice}
                </p>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={closeDepartmentModal}
                  className="px-3 py-2 rounded-lg text-xs font-bold border"
                  style={{ borderColor: C.steelBlue, color: C.steelBlue }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAssignedDepartment}
                  className="px-3 py-2 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: C.sidebarBg, color: C.cream }}
                >
                  Save Department
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedUserForPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={closePasswordModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
              style={{ backgroundColor: C.secondaryDark }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: C.cream }}>
                  Set / Reset Password
                </h3>
                <button onClick={closePasswordModal} style={{ color: C.steelBlue }}>
                  <X size={18} />
                </button>
              </div>

              <p className="text-sm mb-4" style={{ color: C.steelBlue }}>
                User: {selectedUserForPassword.first_name} {selectedUserForPassword.last_name}
              </p>

              <label className="block text-sm font-medium mb-1.5" style={{ color: C.steelBlue }}>
                Password
              </label>
              <input
                type="text"
                value={passwordDraft}
                onChange={e => setPasswordDraft(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                style={{ borderColor: C.steelBlue, color: C.cream }}
              />

              <p className="text-xs mt-2" style={{ color: C.steelBlue }}>
                Tip: click Reset to Last Name to use "{selectedUserForPassword.last_name}".
              </p>

              {passwordNotice && (
                <p className="text-xs mt-3" style={{ color: passwordNotice.includes('successfully') ? '#86efac' : '#fca5a5' }}>
                  {passwordNotice}
                </p>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resetToLastName();
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-bold border"
                  style={{ borderColor: C.steelBlue, color: C.steelBlue }}
                >
                  Reset to Last Name
                </button>
                <button
                  type="button"
                  onClick={saveUserPassword}
                  className="px-3 py-2 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: C.sidebarBg, color: C.cream }}
                >
                  Save Password
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {Object.keys(userPasswords).length > 0 && (
        <p className="text-xs mt-3" style={{ color: C.mutedBlue }}>
          {Object.keys(userPasswords).length} user password{Object.keys(userPasswords).length !== 1 ? 's' : ''} updated.
        </p>
      )}
    </div>
  );
}

// ─── Password settings section ───────────────────────────────────────────────
function PasswordSection({
  isSaving, error, success, onSubmit,
}: {
  isSaving: boolean;
  error: string;
  success: string;
  onSubmit: (currentPassword: string, nextPassword: string, confirmPassword: string) => Promise<void>;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const submitPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(currentPassword, nextPassword, confirmPassword);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Password Settings</h2>
        <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>
          Confirm your current password before setting a new one.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <form onSubmit={submitPasswordChange} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.mutedBlue }}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.mutedBlue }}>New Password</label>
            <input
              type="password"
              value={nextPassword}
              onChange={e => setNextPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.mutedBlue }}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border outline-none"
              style={{ borderColor: C.steelBlue, color: C.primaryDark }}
            />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}

          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
            style={{ backgroundColor: C.sidebarBg, color: C.cream }}
          >
            {isSaving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Academics section ───────────────────────────────────────────────────────
interface AcademicCourseRecord {
  course_id: number;
  course_code: string;
  title: string;
  credits: number;
  department: string;
  description: string;
}

interface AcademicSectionRecord {
  section_id: number;
  course_id: number;
  section_number: string;
  term: string;
  instructor: string;
  building: string;
  room: string;
  days: string;
  time: string;
  capacity: number;
  enrolled: number;
  status: 'Open' | 'Closed' | 'Waitlist';
}

const EMPTY_ACADEMIC_COURSE_FORM: Omit<AcademicCourseRecord, 'course_id'> = {
  course_code: '',
  title: '',
  credits: 3,
  department: '',
  description: '',
};

const EMPTY_ACADEMIC_SECTION_FORM: Omit<AcademicSectionRecord, 'section_id'> = {
  course_id: 1,
  section_number: '',
  term: 'Spring 2026',
  instructor: '',
  building: '',
  room: '',
  days: '',
  time: '',
  capacity: 30,
  enrolled: 0,
  status: 'Open',
};

function AcademicsSection({
  rooms,
}: {
  rooms: RoomData[];
  selectedRoom?: RoomData | null;
  onSelectRoom?: (room: RoomData | null) => void;
}) {
  const [courses, setCourses] = useState<AcademicCourseRecord[]>([]);
  const [sections, setSections] = useState<AcademicSectionRecord[]>([]);
  const [courseForm, setCourseForm] = useState(EMPTY_ACADEMIC_COURSE_FORM);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [courseFormMessage, setCourseFormMessage] = useState('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState(EMPTY_ACADEMIC_SECTION_FORM);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionFormMessage, setSectionFormMessage] = useState('');
  const [sectionDaysSelected, setSectionDaysSelected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  useEffect(() => {
    const loadAcademics = async () => {
      try {
        const [courseRes, sectionRes] = await Promise.all([
          apiFetch(`${API_URL}/courses`),
          apiFetch(`${API_URL}/sections`),
        ]);

        const courseData = courseRes.ok ? await courseRes.json() : [];
        const sectionData = sectionRes.ok ? await sectionRes.json() : [];

        setCourses(Array.isArray(courseData) ? courseData : []);
        setSections(Array.isArray(sectionData) ? sectionData : []);
      } catch {
        setCourses([]);
        setSections([]);
      }
    };

    loadAcademics();
  }, []);

  const getCourseLabel = (courseId: number): string => {
    const course = courses.find(c => c.course_id === courseId);
    return course ? `${course.course_code} · ${course.title}` : 'Unknown';
  };

  const toggleSectionDay = (day: string) => {
    const updated = new Set(sectionDaysSelected);
    if (updated.has(day)) {
      updated.delete(day);
    } else {
      updated.add(day);
    }
    setSectionDaysSelected(updated);
    setSectionForm(prev => ({ ...prev, days: Array.from(updated).sort().join('/') }));
  };

  const resetCourseForm = () => {
    setCourseForm(EMPTY_ACADEMIC_COURSE_FORM);
    setEditingCourseId(null);
    setCourseFormMessage('');
    setIsCourseModalOpen(false);
  };

  const startCourseEdit = (course: AcademicCourseRecord) => {
    setEditingCourseId(course.course_id);
    setCourseForm(course);
    setCourseFormMessage('');
    setIsCourseModalOpen(true);
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.course_code.trim() || !courseForm.title.trim()) {
      setCourseFormMessage('Course code and title are required.');
      return;
    }
    try {
      const res = await apiFetch(
        editingCourseId ? `${API_URL}/courses/${editingCourseId}` : `${API_URL}/courses`,
        {
          method: editingCourseId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseForm),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save course');
      setCourseFormMessage(editingCourseId ? 'Course updated successfully!' : 'Course created successfully!');
      const refreshed = await apiFetch(`${API_URL}/courses`);
      setCourses(await refreshed.json().catch(() => []));
    } catch (err) {
      setCourseFormMessage(err instanceof Error ? err.message : 'Could not save course.');
      return;
    }
    setTimeout(() => resetCourseForm(), 1000);
  };

  const resetSectionForm = () => {
    setSectionForm(EMPTY_ACADEMIC_SECTION_FORM);
    setEditingSectionId(null);
    setSectionFormMessage('');
    setSectionDaysSelected(new Set());
  };

  const startSectionEdit = (section: AcademicSectionRecord) => {
    setEditingSectionId(section.section_id);
    setSectionForm(section);
    setSectionFormMessage('');
    const dayArray = section.days.split('/').map(d => d.trim());
    setSectionDaysSelected(new Set(dayArray));
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionForm.course_id || !sectionForm.section_number.trim() || sectionDaysSelected.size === 0) {
      setSectionFormMessage('Course, section number, and at least one day are required.');
      return;
    }
    try {
      const res = await apiFetch(
        editingSectionId ? `${API_URL}/sections/${editingSectionId}` : `${API_URL}/sections`,
        {
          method: editingSectionId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionForm),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save section');
      setSectionFormMessage(editingSectionId ? 'Section updated successfully!' : 'Section created successfully!');
      const refreshed = await apiFetch(`${API_URL}/sections`);
      setSections(await refreshed.json().catch(() => []));
    } catch (err) {
      setSectionFormMessage(err instanceof Error ? err.message : 'Could not save section.');
      return;
    }
    setTimeout(() => resetSectionForm(), 1000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Academics</h2>
        <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>Manage courses, sections, and view enrollment data.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Courses" value={String(courses.length)} accent="#0F766E" />
        <StatCard label="Sections" value={String(sections.length)} accent="#8B5CF6" />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('create')}
          className="px-4 py-3 rounded-lg font-semibold text-sm"
          style={{
            backgroundColor: activeTab === 'create' ? C.sidebarBg : 'transparent',
            color: activeTab === 'create' ? C.cream : C.mutedBlue,
            border: `2px solid ${activeTab === 'create' ? C.sidebarBg : C.steelBlue}`,
          }}
        >
          CREATE COURSE/SECTION
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className="px-4 py-3 rounded-lg font-semibold text-sm"
          style={{
            backgroundColor: activeTab === 'manage' ? C.sidebarBg : 'transparent',
            color: activeTab === 'manage' ? C.cream : C.mutedBlue,
            border: `2px solid ${activeTab === 'manage' ? C.sidebarBg : C.steelBlue}`,
          }}
        >
          MANAGE COURSES/SECTIONS
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 min-h-[600px]">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ color: C.primaryDark }}>Add New Course</h3>
              <button
                onClick={() => {
                  setCourseForm(EMPTY_ACADEMIC_COURSE_FORM);
                  setEditingCourseId(null);
                  setCourseFormMessage('');
                  setIsCourseModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold mb-4"
                style={{ backgroundColor: C.sidebarBg, color: C.cream }}
              >
                <Plus size={16} /> New Course
              </button>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ color: C.primaryDark }}>Create New Section</h3>
              <form onSubmit={handleSectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Course</label>
                  <select
                    value={sectionForm.course_id}
                    onChange={e => setSectionForm(prev => ({ ...prev, course_id: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                  >
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_code} · {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Section #</label>
                    <input
                      type="text"
                      value={sectionForm.section_number}
                      onChange={e => setSectionForm(prev => ({ ...prev, section_number: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                      placeholder="01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Instructor</label>
                    <input
                      type="text"
                      value={sectionForm.instructor}
                      onChange={e => setSectionForm(prev => ({ ...prev, instructor: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                      placeholder="Dr. Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Days</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sectionDaysSelected.has(day)}
                          onChange={() => toggleSectionDay(day)}
                          className="w-4 h-4"
                        />
                        <span style={{ color: C.primaryDark }}>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Building</label>
                    <select
                      value={sectionForm.building}
                      onChange={e => setSectionForm(prev => ({ ...prev, building: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                    >
                      <option value="">Select building</option>
                      {Array.from(new Set(rooms.map(r => r.building))).map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Room</label>
                    <select
                      value={sectionForm.room}
                      onChange={e => {
                        const room = rooms.find(r => r.room === e.target.value && r.building === sectionForm.building);
                        setSectionForm(prev => ({
                          ...prev,
                          room: e.target.value,
                          capacity: room?.capacity || 30
                        }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                    >
                      <option value="">Select room</option>
                      {rooms.filter(r => r.building === sectionForm.building).map(r => (
                        <option key={`${r.building}-${r.room}`} value={r.room}>{r.room} (Cap: {r.capacity})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Time</label>
                    <select
                      value={sectionForm.time}
                      onChange={e => setSectionForm(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                    >
                      <option value="">Select time</option>
                      {['08:00-09:30', '09:00-10:15', '09:30-11:00', '10:00-11:30', '11:00-12:15', '11:30-13:00', '13:00-14:15', '13:30-15:00', '14:00-15:30', '15:00-16:30', '16:00-17:30'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: C.mutedBlue }}>Term</label>
                    <select
                      value={sectionForm.term}
                      onChange={e => setSectionForm(prev => ({ ...prev, term: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                      style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                    >
                      {['Spring 2026', 'Summer 2026', 'Fall 2026', 'Winter 2026', 'Spring 2027'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {sectionFormMessage && (
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: sectionFormMessage.toLowerCase().includes('success') ? '#dcfce7' : '#fef3c7',
                      color: sectionFormMessage.toLowerCase().includes('success') ? '#15803d' : '#92400e',
                    }}
                  >
                    {sectionFormMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-semibold text-sm text-white"
                  style={{ backgroundColor: C.sidebarBg }}
                >
                  {editingSectionId ? 'Update Section' : 'Create Section'}
                </button>
                {editingSectionId && (
                  <button
                    type="button"
                    onClick={resetSectionForm}
                    className="w-full py-2 rounded-lg font-semibold text-sm border"
                    style={{ borderColor: C.steelBlue, color: C.mutedBlue }}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-4" style={{ color: C.primaryDark }}>Courses ({courses.length})</h3>
              <div className="space-y-3">
                {courses.length === 0 ? (
                  <p style={{ color: C.mutedBlue }}>No courses yet</p>
                ) : (
                  courses.map(course => (
                    <div key={course.course_id} className="rounded-lg border p-3 flex justify-between gap-3" style={{ borderColor: C.steelBlue }}>
                      <div>
                        <p style={{ color: C.primaryDark }} className="font-semibold text-sm">{course.course_code}</p>
                        <p style={{ color: C.mutedBlue }} className="text-xs">{course.title}</p>
                      </div>
                      <button
                        onClick={() => startCourseEdit(course)}
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: C.mutedBlue, color: C.cream }}
                      >
                        Edit
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4" style={{ color: C.primaryDark }}>Sections ({sections.length})</h3>
              <div className="space-y-3">
                {sections.length === 0 ? (
                  <p style={{ color: C.mutedBlue }}>No sections yet</p>
                ) : (
                  sections.map(section => (
                    <div key={section.section_id} className="rounded-lg border p-3 flex justify-between gap-3" style={{ borderColor: C.steelBlue }}>
                      <div>
                        <p style={{ color: C.primaryDark }} className="font-semibold text-sm">{getCourseLabel(section.course_id)} - Sec {section.section_number}</p>
                        <p style={{ color: C.mutedBlue }} className="text-xs">{section.days} · {section.time}</p>
                      </div>
                      <button
                        onClick={() => startSectionEdit(section)}
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: C.mutedBlue, color: C.cream }}
                      >
                        Edit
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Modal */}
      <AnimatePresence>
        {isCourseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => resetCourseForm()}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>
                  {editingCourseId ? 'Edit Course' : 'Create Course'}
                </h2>
                <button type="button" onClick={() => resetCourseForm()} className="p-1 rounded-lg hover:bg-gray-100">
                  <X size={20} style={{ color: C.mutedBlue }} />
                </button>
              </div>

              <form onSubmit={handleCourseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: C.primaryDark }}>Course Code *</label>
                  <input
                    type="text"
                    value={courseForm.course_code}
                    onChange={e => setCourseForm(prev => ({ ...prev, course_code: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                    placeholder="CSC 101"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: C.primaryDark }}>Title *</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={e => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                    placeholder="Introduction to Programming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: C.primaryDark }}>Credits *</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={courseForm.credits}
                    onChange={e => setCourseForm(prev => ({ ...prev, credits: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ borderColor: C.steelBlue, color: C.primaryDark }}
                  />
                </div>

                {courseFormMessage && (
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: courseFormMessage.toLowerCase().includes('success') ? '#dcfce7' : '#fef3c7',
                      color: courseFormMessage.toLowerCase().includes('success') ? '#15803d' : '#92400e',
                    }}
                  >
                    {courseFormMessage}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 py-2.5 rounded-lg font-semibold text-sm text-white" style={{ backgroundColor: C.sidebarBg }}>
                    {editingCourseId ? 'Save Course' : 'Create Course'}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetCourseForm()}
                    className="px-4 py-2.5 rounded-lg font-semibold text-sm border"
                    style={{ borderColor: C.steelBlue, color: C.mutedBlue }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Placeholder section ──────────────────────────────────────────────────────
function PlaceholderSection({
  title, description, color,
}: { title: string; description: string; color: string }) {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>{title}</h2>
        <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>{description}</p>
      </div>

      <div
        className="rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-64"
        style={{ backgroundColor: color, opacity: 0.92 }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <Settings size={28} color="rgba(255,255,255,0.9)" />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: C.cream }}>
          {title}
        </h3>
        <p className="text-sm max-w-sm" style={{ color: 'rgba(240,235,216,0.75)' }}>
          This section is under construction. Backend routes and UI components will be wired here.
        </p>
      </div>
    </div>
  );
}

// ─── Shared: ticket table ─────────────────────────────────────────────────────
function TicketTable({
  tickets, isLoading, onEdit, onDelete, readOnly = false, clickableRows = false,
}: {
  tickets: TicketData[];
  isLoading: boolean;
  onEdit: (t: TicketData) => void;
  onDelete: (id: number) => void;
  readOnly?: boolean;
  clickableRows?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr style={{ backgroundColor: C.secondaryDark, color: '#fff' }}>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">ID</th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Title</th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Priority</th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Assignee</th>
            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Date</th>
            {!readOnly && <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {isLoading ? (
            <tr><td colSpan={7} className="px-5 py-8 text-center text-sm" style={{ color: C.mutedBlue }}>Loading...</td></tr>
          ) : tickets.length === 0 ? (
            <tr><td colSpan={7} className="px-5 py-8 text-center text-sm" style={{ color: C.mutedBlue }}>No tickets found.</td></tr>
          ) : (
            tickets.map(row => (
              <tr
                key={row.id}
                className={`hover:bg-black/[0.02] transition-colors group ${clickableRows ? 'cursor-pointer' : ''}`}
                onClick={clickableRows ? () => onEdit(row) : undefined}
              >
                <td className="px-5 py-4 font-mono text-xs" style={{ color: C.mutedBlue }}>#{row.id}</td>
                <td className="px-5 py-4 text-sm font-medium" style={{ color: C.primaryDark }}>{row.title}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    row.status === 'Approved' || row.status === 'Resolved'
                      ? 'bg-green-100 text-green-700'
                      : row.status === 'In Progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>{row.status}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`flex items-center gap-1.5 text-sm font-medium`} style={{ color: C.primaryDark }}>
                    <span className={`w-2 h-2 rounded-full ${
                      row.priority === 'High' ? 'bg-red-500' : row.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-400'
                    }`} />
                    {row.priority}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>
                  {row.assignee || 'Unassigned'}
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: C.primaryDark }}>
                  {row.dateSubmitted ? new Date(row.dateSubmitted).toLocaleDateString() : '—'}
                </td>
                {!readOnly && (
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Settings size={15} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Access Control Section ───────────────────────────────────────────────────
// ─── Access Control Section ───────────────────────────────────────────────────
function AccessControlSection({
  lostCards,
  isLoadingCards,
  cardError,
  accessLogs,
  isLoadingLogs,
  logsError,
  activeTab,
  onTabChange,
}: {
  lostCards: LostCardData[];
  isLoadingCards: boolean;
  cardError: string;
  accessLogs: AccessLogData[];
  isLoadingLogs: boolean;
  logsError: string;
  activeTab: 'logs' | 'cards';
  onTabChange: (tab: 'logs' | 'cards') => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: C.primaryDark }}>Access Control</h2>
          <p className="text-sm mt-1" style={{ color: C.mutedBlue }}>
            View access logs and manage lost ID cards
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Access Logs" value={accessLogs.length.toString()} accent="#3b82f6" />
        <StatCard label="Denied Access" value={accessLogs.filter(l => l.result === 'Denied' || l.result === 'Failed').length.toString()} accent="#ef4444" />
        <StatCard label="Lost Cards (Open)" value={lostCards.filter(c => c.status === 'Open').length.toString()} accent="#f59e0b" />
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="flex border-b border-black/5">
          <button
            onClick={() => onTabChange('logs')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'border-b-2 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={activeTab === 'logs' ? { borderBottomColor: '#3b82f6' } : {}}
          >
            Access Logs (Door Swipes)
          </button>
          <button
            onClick={() => onTabChange('cards')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'cards'
                ? 'border-b-2 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={activeTab === 'cards' ? { borderBottomColor: '#3b82f6' } : {}}
          >
            Lost ID Cards
          </button>
        </div>

        {/* Access Logs Tab */}
        {activeTab === 'logs' && (
          <div>
            {logsError && (
              <div className="px-6 py-4 text-red-600 bg-red-50 border-b border-red-200">
                {logsError}
              </div>
            )}

            {isLoadingLogs ? (
              <div className="px-6 py-8 text-center" style={{ color: C.mutedBlue }}>
                Loading access logs...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Log ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Access Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Door / Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accessLogs.map((log) => (
                      <tr key={log.log_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono" style={{ color: C.mutedBlue }}>
                          #{log.log_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: C.primaryDark }}>
                          {log.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: C.primaryDark }}>
                          {log.access_type}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: C.primaryDark }}>
                          {log.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: C.primaryDark }}>
                          {log.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            log.result === 'Granted' || log.result === 'Success'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Lost Cards Tab */}
        {activeTab === 'cards' && (
          <div>
            {cardError && (
              <div className="px-6 py-4 text-red-600 bg-red-50 border-b border-red-200">
                {cardError}
              </div>
            )}

            {isLoadingCards ? (
              <div className="px-6 py-8 text-center" style={{ color: C.mutedBlue }}>
                Loading lost cards...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Card ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Reported Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Replacement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: C.steelBlue }}>
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lostCards.map((card) => (
                      <tr key={card.card_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: C.primaryDark }}>
                          #{card.card_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: C.primaryDark }}>
                          {card.user_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: C.primaryDark }}>
                          {card.reported_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            card.status === 'Resolved' || card.status === 'Closed'
                              ? 'bg-green-100 text-green-800'
                              : card.status === 'Under Review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {card.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: C.primaryDark }}>
                          {card.replacement_requested ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 text-sm" style={{ color: C.primaryDark }}>
                          {card.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.steelBlue }}>
        {label}
      </p>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold" style={{ color: C.primaryDark }}>{value}</span>
        <span className="w-3 h-3 rounded-full mb-1" style={{ backgroundColor: accent }} />
      </div>
    </div>
  );
}