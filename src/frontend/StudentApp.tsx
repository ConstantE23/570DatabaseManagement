/*
  Name: Makaila Williams
  Course: CSC-570-01
  Project: Smart University Campus Operations Management System
  File: StudentApp.tsx
  Description: Student View Front End...landing page, tickets, enrollment, housing contract

*/

import React, { useEffect, useState } from 'react';
import
{
  GraduationCap,
  Wrench,
  BookOpen,
  Home,
  LogOut,
  Plus,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';

import
{
  motion,
  AnimatePresence,
} from 'motion/react';

// color palette matches existing App.tsx 
const COLORS = 
{
  primaryDark: '#0D1321',
  secondaryDark: '#1D2D44',
  mutedBlue: '#3E5C76',
  steelBlue: '#748CAB',
  cream: '#F0EBD8',
  skyBlue: '#BAE6FD',
};

// backend URL frm same server the panel uses
const API_URL = 'http://4.239.243.37:5001';

// mock data for demo login
const DEMO_USER: CurrentUser = {
  user_id: 12345,
  first_name: 'Alex',
  last_name: 'Johnson',
  email: 'alex.johnson@university.edu',
};

const DEMO_TICKETS: TicketData[] = [
  {
    id: 101,
    user_id: 12345,
    title: 'Broken Desk Lamp',
    status: 'In Progress',
    priority: 'Medium',
    dateSubmitted: '2026-04-20',
  },
  {
    id: 102,
    user_id: 12345,
    title: 'AC Not Working',
    status: 'Pending',
    priority: 'High',
    dateSubmitted: '2026-04-25',
  },
  {
    id: 103,
    user_id: 12345,
    title: 'Door Lock Issue',
    status: 'Resolved',
    priority: 'Medium',
    dateSubmitted: '2026-04-18',
  },
];

const DEMO_ENROLLMENTS: Enrollment[] = [
  {
    enrollment_id: 201,
    course_id: 'CSC-570',
    course_name: 'Smart Campus Operations Management',
    section: '01',
    credits: 3,
    status: 'Enrolled',
  },
  {
    enrollment_id: 202,
    course_id: 'CSC-480',
    course_name: 'Software Engineering',
    section: '02',
    credits: 4,
    status: 'Enrolled',
  },
  {
    enrollment_id: 203,
    course_id: 'MATH-210',
    course_name: 'Linear Algebra',
    section: '03',
    credits: 3,
    status: 'Enrolled',
  },
];

const DEMO_HOUSING: HousingContract = {
  contract_id: 301,
  dorm: 'North Hall',
  room: '204B',
  room_type: 'Double',
  start_date: '2026-08-15',
  end_date: '2027-05-30',
  status: 'Active',
};

// types for the data coming back from the backend
interface CurrentUser
{
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Enrollment
{
  enrollment_id: number;
  course_id: string;
  course_name: string;
  section: string;
  credits: number;
  status: string;
}

interface HousingContract
{
  contract_id: number;
  dorm: string;
  room: string;
  room_type: string;
  start_date: string;
  end_date: string;
  status: string;
}

interface TicketData
{
  id: number;
  user_id: number;
  title: string;
  status: string;
  priority: string;
  dateSubmitted: string;
}

// the four pages the student can navigate to
type Tab = 'overview' | 'tickets' | 'enrollment' | 'housing';

interface StudentAppProps
{
  onBackToPortal?: () => void;
}

export default function StudentApp({ onBackToPortal }: StudentAppProps)
{
  // login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // which tab is showing
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // data from the backend
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [housing, setHousing] = useState<HousingContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ticket form fields
  const [ticketModal, setTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketLocation, setTicketLocation] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');

  // housing form fields
  const [housingModal, setHousingModal] = useState(false);
  const [dormPreference, setDormPreference] = useState('');
  const [roomType, setRoomType] = useState('Single');

  // fetch all the student data once they log in
  const fetchStudentData = async (user_id: number) =>
  {
    setIsLoading(true);

    try
    {
      // get tickets for this student
      const ticketRes = await fetch(`${API_URL}/tickets/user/${user_id}`);
      if (ticketRes.ok)
      {
        const ticketData = await ticketRes.json();
        setTickets(Array.isArray(ticketData) ? ticketData : []);
      }

      // get enrollments for this student
      const enrollRes = await fetch(`${API_URL}/enrollments?user_id=${user_id}`);
      if (enrollRes.ok)
      {
        const enrollData = await enrollRes.json();
        setEnrollments(Array.isArray(enrollData) ? enrollData : []);
      }

      // get housing contract for this student
      // backend sends back empty {} if there is no contract
      const housingRes = await fetch(`${API_URL}/housing?user_id=${user_id}`);
      if (housingRes.ok)
      {
        const housingData = await housingRes.json();
        setHousing(housingData && housingData.contract_id ? housingData : null);
      }

    }
    catch (error)
    {
      console.error('Error loading student data:', error);

    }
    finally
    {
      setIsLoading(false);
    }
  };

  // run fetchStudentData when the student logs in
  useEffect(() =>
  {
    if (isLoggedIn && currentUser)
    {
      fetchStudentData(currentUser.user_id);
    }
  }, [isLoggedIn]);

  // handle login form submit
  const handleLogin = async (e: React.FormEvent) =>
  {
    e.preventDefault();

    try
    {
      setLoginError('');

      const response = await fetch(`${API_URL}/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

      const data = await response.json();

      if (!response.ok)
      {
        throw new Error(data.error || 'Login failed');
      }

      setCurrentUser(data.user);
      setIsLoggedIn(true);

    }
    catch (error)
    {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  // demo login for testing without backend
  const handleDemoLogin = () =>
  {
    setLoginError('');
    setCurrentUser(DEMO_USER);
    setTickets(DEMO_TICKETS);
    setEnrollments(DEMO_ENROLLMENTS);
    setHousing(DEMO_HOUSING);
    setIsLoggedIn(true);
  };

  // handle logout n clear everything out
  const handleLogout = () =>
  {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setCurrentUser(null);
    setTickets([]);
    setEnrollments([]);
    setHousing(null);
    setActiveTab('overview');
    setLoginError('');

    if (onBackToPortal)
    {
      onBackToPortal();
    }
  };
  
  // create a new maintenance ticket
  const handleCreateTicket = async (e: React.FormEvent) =>
  {
    e.preventDefault();
    //if mock mode just add it locally without hitting the backend

    if(mockMode)
    {
      const newTicket: TicketData = 
      {
        id: tickets.length + 104,
      user_id: 1,
      title: ticketTitle,
      status: 'Pending',
      priority: ticketPriority,
      dateSubmitted: new Date().toISOString().split('T')[0],
      };

      setTickets([...tickets, newTicket]);
      setTicketModal(false);
      setTicketTitle('');
      setTicketLocation('');
      setTicketPriority('Medium');
      return;
    }

    //if backend is live send it for real
    try
    {
      const response = await fetch(`${API_URL}/tickets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          {
            user_id: currentUser?.user_id,
            title: ticketTitle,
            location: ticketLocation,
            priority: ticketPriority,
            status: 'Pending',
          }),
      });

      if (!response.ok) throw new Error('Failed to create ticket');

      setTicketModal(false);
      setTicketTitle('');
      setTicketLocation('');
      setTicketPriority('Medium');

      if (currentUser) fetchStudentData(currentUser.user_id);
    }
    catch (error)
    {
      console.error('Error creating ticket:', error);
    }
  };
  
  // submit a housing contract request
  const handleAssignContract = async (e: React.FormEvent) =>
  {
    e.preventDefault();

    try
    {
      const response = await fetch(`${API_URL}/housing/assign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
          {
            user_id: currentUser?.user_id,
            dorm_preference: dormPreference,
            room_type: roomType,
          }),
        });

      if (!response.ok) throw new Error('Failed to assign contract');

      // close form and reset
      setHousingModal(false);
      setDormPreference('');
      setRoomType('Single');

      // reload data
      if (currentUser) fetchStudentData(currentUser.user_id);

    }
    catch (error)
    {
      console.error('Error assigning contract:', error);
    }
  };

  // count tickets that are not done yet
  const openTickets = tickets.filter((t) => t.status === 'Pending' || t.status === 'In Progress').length;

  // add up credit hours for enrolled courses only
  const totalCredits = enrollments
    .filter((e) => e.status === 'Enrolled')
    .reduce((sum, e) => sum + (e.credits || 0), 0);

  // landing page n shows before login
  if (!isLoggedIn)
  {
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
          {onBackToPortal && (
            <button
              type="button"
              onClick={onBackToPortal}
              className="mb-4 text-xs font-semibold uppercase tracking-wider hover:underline"
              style={{ color: COLORS.steelBlue }}
            >
              Back to portal selection
            </button>
          )}

          {/* logo and title */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="p-4 rounded-full mb-4"
              style={{ backgroundColor: COLORS.mutedBlue }}
            >
              <GraduationCap size={40} color={COLORS.cream} />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: COLORS.cream }}>
              Student Portal
            </h1>
            <p className="text-sm mt-2" style={{ color: COLORS.steelBlue }}>
              Smart University Campus Operations System
            </p>
          </div>

          {/* login form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.steelBlue }}
              >
                University Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                placeholder="you@university.edu"
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
                className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-lg hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: COLORS.cream, color: COLORS.primaryDark }}
            >
              Sign In
            </button>
          </form>

          {/* demo login button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full mt-3 py-3 rounded-lg font-bold text-lg hover:opacity-80 active:scale-95 transition-all"
            style={{ backgroundColor: COLORS.mutedBlue, color: COLORS.cream, border: `2px solid ${COLORS.skyBlue}` }}
          >
            Try Demo (Instant Access)
          </button>

          {/* show error if login fails */}
          {loginError && (
            <div className="mt-4 text-sm text-red-400 text-center">
              {loginError}
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: COLORS.steelBlue }}>
              Demo: use your email · password is your last name
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // main dashboard
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: COLORS.skyBlue }}>

      {/* sidebar */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ backgroundColor: COLORS.primaryDark }}
      >
        {/* app name */}
        <div className="p-6 flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.mutedBlue }}>
            <GraduationCap size={24} color={COLORS.cream} />
          </div>
          <div>
            <span className="text-lg font-bold block" style={{ color: COLORS.cream }}>
              Student Hub
            </span>
            <span className="text-xs" style={{ color: COLORS.steelBlue }}>
              Campus Operations
            </span>
          </div>
        </div>

        {/* nav buttons */}
        <nav className="flex-1 px-4 py-4 space-y-1">

          <button
            onClick={() => setActiveTab('overview')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
            style={{
              backgroundColor: activeTab === 'overview' ? COLORS.mutedBlue : 'transparent',
              color: activeTab === 'overview' ? COLORS.cream : COLORS.steelBlue,
            }}
          >
            <GraduationCap size={18} />
            <span className="font-medium text-sm">Overview</span>
            {activeTab === 'overview' && <ChevronRight size={14} className="ml-auto" />}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
            style={{
              backgroundColor: activeTab === 'tickets' ? COLORS.mutedBlue : 'transparent',
              color: activeTab === 'tickets' ? COLORS.cream : COLORS.steelBlue,
            }}
          >
            <Wrench size={18} />
            <span className="font-medium text-sm">Maintenance Tickets</span>
            {activeTab === 'tickets' && <ChevronRight size={14} className="ml-auto" />}
          </button>

          <button
            onClick={() => setActiveTab('enrollment')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
            style={{
              backgroundColor: activeTab === 'enrollment' ? COLORS.mutedBlue : 'transparent',
              color: activeTab === 'enrollment' ? COLORS.cream : COLORS.steelBlue,
            }}
          >
            <BookOpen size={18} />
            <span className="font-medium text-sm">My Enrollment</span>
            {activeTab === 'enrollment' && <ChevronRight size={14} className="ml-auto" />}
          </button>

          <button
            onClick={() => setActiveTab('housing')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left"
            style={{
              backgroundColor: activeTab === 'housing' ? COLORS.mutedBlue : 'transparent',
              color: activeTab === 'housing' ? COLORS.cream : COLORS.steelBlue,
            }}
          >
            <Home size={18} />
            <span className="font-medium text-sm">Housing Contract</span>
            {activeTab === 'housing' && <ChevronRight size={14} className="ml-auto" />}
          </button>

        </nav>

        {/* name and logout */}
        <div className="p-4 border-t" style={{ borderColor: COLORS.secondaryDark }}>
          <div className="flex items-center gap-3 mb-3 px-1">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: COLORS.mutedBlue, color: COLORS.cream }}
            >
              {currentUser ? currentUser.first_name[0].toUpperCase() : 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: COLORS.cream }}>
                {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Student'}
              </p>
              <p className="text-xs" style={{ color: COLORS.steelBlue }}>Student</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Back to portal</span>
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* top bar */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm border-b border-black/5">
          <h2 className="text-xl font-bold" style={{ color: COLORS.primaryDark }}>
            {activeTab === 'overview' && 'Dashboard Overview'}
            {activeTab === 'tickets' && 'Maintenance Tickets'}
            {activeTab === 'enrollment' && 'My Enrollment'}
            {activeTab === 'housing' && 'Housing Contract'}
          </h2>
          <div className="flex items-center gap-4">

            {/* bell icon - shows a red dot if there are open tickets */}
            <button className="relative p-2 rounded-full hover:bg-black/5 transition-colors">
              <Bell size={20} color={COLORS.primaryDark} />
              {openTickets > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* student name display */}
            <div className="flex items-center gap-2 pl-4 border-l border-black/10">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: COLORS.mutedBlue, color: COLORS.cream }}
              >
                {currentUser ? currentUser.first_name[0].toUpperCase() : 'S'}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: COLORS.primaryDark }}>
                  {currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : 'Student'}
                </p>
                <p className="text-xs" style={{ color: COLORS.mutedBlue }}>Student Account</p>
              </div>
            </div>

          </div>
        </header>

        {/* tab pages */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">

              {/* overview */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <p className="text-sm mb-6" style={{ color: COLORS.mutedBlue }}>
                    Welcome back, {currentUser?.first_name}. Here is your semester at a glance.
                  </p>

                  {/* three summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

                    <button
                      onClick={() => setActiveTab('enrollment')}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 text-left hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen size={20} color={COLORS.mutedBlue} />
                        <p className="text-sm font-medium" style={{ color: COLORS.mutedBlue }}>
                          Enrolled Courses
                        </p>
                      </div>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
                        {enrollments.filter((e) => e.status === 'Enrolled').length}
                      </p>
                      <p className="text-xs mt-1" style={{ color: COLORS.steelBlue }}>
                        {totalCredits} credit hours
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('housing')}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 text-left hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Home size={20} color={COLORS.mutedBlue} />
                        <p className="text-sm font-medium" style={{ color: COLORS.mutedBlue }}>
                          Housing Status
                        </p>
                      </div>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
                        {housing ? housing.status : 'None'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: COLORS.steelBlue }}>
                        {housing ? `${housing.dorm} · ${housing.room}` : 'No contract on file'}
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab('tickets')}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 text-left hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench size={20} color={COLORS.mutedBlue} />
                        <p className="text-sm font-medium" style={{ color: COLORS.mutedBlue }}>
                          Open Tickets
                        </p>
                      </div>
                      <p className="text-3xl font-bold" style={{ color: COLORS.primaryDark }}>
                        {openTickets}
                      </p>
                      <p className="text-xs mt-1" style={{ color: COLORS.steelBlue }}>
                        {tickets.length} total submitted
                      </p>
                    </button>

                  </div>

                  {/* quick action buttons */}
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                    <h3 className="font-bold mb-4" style={{ color: COLORS.primaryDark }}>
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                      <button
                        onClick={() => { setActiveTab('tickets'); setTicketModal(true); }}
                        className="flex items-center gap-3 p-4 rounded-xl border border-black/5 hover:bg-black/[0.02] transition-colors text-left"
                      >
                        <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.skyBlue }}>
                          <Plus size={18} color={COLORS.mutedBlue} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: COLORS.primaryDark }}>Submit a Ticket</p>
                          <p className="text-xs" style={{ color: COLORS.steelBlue }}>Report a maintenance issue</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('enrollment')}
                        className="flex items-center gap-3 p-4 rounded-xl border border-black/5 hover:bg-black/[0.02] transition-colors text-left"
                      >
                        <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.skyBlue }}>
                          <BookOpen size={18} color={COLORS.mutedBlue} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: COLORS.primaryDark }}>View Schedule</p>
                          <p className="text-xs" style={{ color: COLORS.steelBlue }}>See your enrolled courses</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('housing')}
                        className="flex items-center gap-3 p-4 rounded-xl border border-black/5 hover:bg-black/[0.02] transition-colors text-left"
                      >
                        <div className="p-2 rounded-lg" style={{ backgroundColor: COLORS.skyBlue }}>
                          <Home size={18} color={COLORS.mutedBlue} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: COLORS.primaryDark }}>Housing Contract</p>
                          <p className="text-xs" style={{ color: COLORS.steelBlue }}>View or request housing</p>
                        </div>
                      </button>

                    </div>
                  </div>
                </motion.div>
              )}

              {/* tickets */}
              {activeTab === 'tickets' && (
                <motion.div
                  key="tickets"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="p-6 border-b border-black/5 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: COLORS.primaryDark }}>
                          My Maintenance Tickets
                        </h3>
                        <p className="text-sm mt-0.5" style={{ color: COLORS.steelBlue }}>
                          {openTickets} open · {tickets.length} total
                        </p>
                      </div>
                      <button
                        onClick={() => setTicketModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.mutedBlue, color: COLORS.cream }}
                      >
                        <Plus size={16} /> New Ticket
                      </button>
                    </div>

                    {isLoading ? (
                      <p className="p-8 text-center text-sm" style={{ color: COLORS.mutedBlue }}>
                        Loading tickets...
                      </p>
                    ) : tickets.length === 0 ? (
                      <div className="p-12 text-center">
                        <Wrench size={32} color={COLORS.steelBlue} className="mx-auto mb-3" />
                        <p className="text-sm" style={{ color: COLORS.steelBlue }}>No tickets submitted yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr style={{ backgroundColor: COLORS.secondaryDark, color: '#fff' }}>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">ID</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Title</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Priority</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5">
                            {tickets.map((ticket) => (
                              <tr key={ticket.id} className="hover:bg-black/[0.02] transition-colors">
                                <td className="px-6 py-4 font-mono text-sm" style={{ color: COLORS.mutedBlue }}>
                                  #{ticket.id}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium" style={{ color: COLORS.primaryDark }}>
                                  {ticket.title}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      ticket.priority === 'High' ? 'bg-red-500' :
                                      ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-400'
                                    }`} />
                                    <span className="text-sm" style={{ color: COLORS.primaryDark }}>
                                      {ticket.priority}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {ticket.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: COLORS.primaryDark }}>
                                  {ticket.dateSubmitted}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* enrollment */}
              {activeTab === 'enrollment' && (
                <motion.div
                  key="enrollment"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                    <div className="p-6 border-b border-black/5 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg" style={{ color: COLORS.primaryDark }}>
                          Current Enrollment
                        </h3>
                        <p className="text-sm mt-0.5" style={{ color: COLORS.steelBlue }}>
                          {totalCredits} credit hours this semester
                        </p>
                      </div>
                      <span
                        className="text-sm font-semibold px-3 py-1 rounded-full"
                        style={{ backgroundColor: COLORS.skyBlue, color: COLORS.primaryDark }}
                      >
                        {enrollments.filter((e) => e.status === 'Enrolled').length} courses
                      </span>
                    </div>

                    {isLoading ? (
                      <p className="p-8 text-center text-sm" style={{ color: COLORS.mutedBlue }}>
                        Loading enrollment...
                      </p>
                    ) : enrollments.length === 0 ? (
                      <div className="p-12 text-center">
                        <BookOpen size={32} color={COLORS.steelBlue} className="mx-auto mb-3" />
                        <p className="text-sm" style={{ color: COLORS.steelBlue }}>
                          No enrollments found for this semester.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr style={{ backgroundColor: COLORS.secondaryDark, color: '#fff' }}>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Course ID</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Course Name</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Section</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Credits</th>
                              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5">
                            {enrollments.map((course) => (
                              <tr key={course.enrollment_id} className="hover:bg-black/[0.02] transition-colors">
                                <td className="px-6 py-4 font-mono text-sm font-medium" style={{ color: COLORS.mutedBlue }}>
                                  {course.course_id}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium" style={{ color: COLORS.primaryDark }}>
                                  {course.course_name}
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: COLORS.primaryDark }}>
                                  {course.section}
                                </td>
                                <td className="px-6 py-4 text-sm" style={{ color: COLORS.primaryDark }}>
                                  {course.credits}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    course.status === 'Enrolled' ? 'bg-green-100 text-green-700' :
                                    course.status === 'Waitlisted' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-600'
                                  }`}>
                                    {course.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* housing */}
              {activeTab === 'housing' && (
                <motion.div
                  key="housing"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="space-y-6"
                >
                  {housing ? (
                    // show current contract if they have one
                    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="font-bold text-lg" style={{ color: COLORS.primaryDark }}>
                            Current Housing Contract
                          </h3>
                          <p className="text-sm mt-0.5" style={{ color: COLORS.steelBlue }}>
                            Contract #{housing.contract_id}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          housing.status === 'Active' ? 'bg-green-100 text-green-700' :
                          housing.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {housing.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.skyBlue + '66' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: COLORS.mutedBlue }}>Dormitory</p>
                          <p className="font-semibold" style={{ color: COLORS.primaryDark }}>{housing.dorm}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.skyBlue + '66' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: COLORS.mutedBlue }}>Room</p>
                          <p className="font-semibold" style={{ color: COLORS.primaryDark }}>{housing.room}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.skyBlue + '66' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: COLORS.mutedBlue }}>Start Date</p>
                          <p className="font-semibold" style={{ color: COLORS.primaryDark }}>{housing.start_date}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ backgroundColor: COLORS.skyBlue + '66' }}>
                          <p className="text-xs font-medium mb-1" style={{ color: COLORS.mutedBlue }}>End Date</p>
                          <p className="font-semibold" style={{ color: COLORS.primaryDark }}>{housing.end_date}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // no contract - show the request button
                    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 text-center">
                      <Home size={40} color={COLORS.steelBlue} className="mx-auto mb-3" />
                      <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.primaryDark }}>
                        No Housing Contract on File
                      </h3>
                      <p className="text-sm mb-6" style={{ color: COLORS.steelBlue }}>
                        Submit a housing request to get assigned a dorm room.
                      </p>
                      <button
                        onClick={() => setHousingModal(true)}
                        className="px-6 py-3 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all"
                        style={{ backgroundColor: COLORS.mutedBlue, color: COLORS.cream }}
                      >
                        Request Housing Assignment
                      </button>
                    </div>
                  )}

                  {housing && (
                    <button
                      onClick={() => setHousingModal(true)}
                      className="px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
                      style={{ backgroundColor: COLORS.mutedBlue, color: COLORS.cream }}
                    >
                      + Request New Contract
                    </button>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ticket form popup */}
      <AnimatePresence>
        {ticketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTicketModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg p-8 rounded-2xl shadow-2xl"
              style={{ backgroundColor: COLORS.secondaryDark }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: COLORS.cream }}>
                  Submit Maintenance Ticket
                </h3>
                <button onClick={() => setTicketModal(false)} className="p-1 rounded-lg hover:bg-white/5">
                  <X size={20} color={COLORS.steelBlue} />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                    Issue Title
                  </label>
                  <input
                    type="text"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                    placeholder="e.g. Broken AC in Room 214"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={ticketLocation}
                    onChange={(e) => setTicketLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                    placeholder="e.g. Armstrong Hall, Room 214"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                    Priority
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                  >
                    <option value="Low" className="bg-slate-800">Low</option>
                    <option value="Medium" className="bg-slate-800">Medium</option>
                    <option value="High" className="bg-slate-800">High</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setTicketModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold border hover:bg-white/5 transition-colors"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.steelBlue }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.cream, color: COLORS.primaryDark }}
                  >
                    Submit Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* housing form popup */}
      <AnimatePresence>
        {housingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHousingModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg p-8 rounded-2xl shadow-2xl"
              style={{ backgroundColor: COLORS.secondaryDark }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold" style={{ color: COLORS.cream }}>
                  Request Housing Assignment
                </h3>
                <button onClick={() => setHousingModal(false)} className="p-1 rounded-lg hover:bg-white/5">
                  <X size={20} color={COLORS.steelBlue} />
                </button>
              </div>

              <form onSubmit={handleAssignContract} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                    Dormitory Preference
                  </label>
                  <input
                    type="text"
                    value={dormPreference}
                    onChange={(e) => setDormPreference(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                    placeholder="e.g. Armstrong Hall"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.steelBlue }}>
                    Room Type
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-transparent border outline-none"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.cream }}
                  >
                    <option value="Single" className="bg-slate-800">Single</option>
                    <option value="Double" className="bg-slate-800">Double</option>
                    <option value="Suite" className="bg-slate-800">Suite</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setHousingModal(false)}
                    className="flex-1 py-3 rounded-lg font-bold border hover:bg-white/5 transition-colors"
                    style={{ borderColor: COLORS.steelBlue, color: COLORS.steelBlue }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-lg font-bold hover:opacity-90 active:scale-95 transition-all"
                    style={{ backgroundColor: COLORS.cream, color: COLORS.primaryDark }}
                  >
                    Submit Request
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
