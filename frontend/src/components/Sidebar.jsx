import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Vote, Award, BarChart2, LogOut, Scale, Settings } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms', icon: Users, label: 'Decision Rooms' },
  { to: '/voting', icon: Vote, label: 'Voting Gallery' },
  { to: '/reputation', icon: Award, label: 'Reputation' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
];

export default function Sidebar() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-[#0F172A] flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-400/20 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-none">Jurist AI</p>
            <p className="text-[10px] text-white/40 mt-0.5 tracking-widest uppercase">Authoritative Clarity</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* Separator */}
        <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
          <NavLink
            to="/guidelines"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            Guidelines
          </NavLink>
          <NavLink
            to="/archives"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            Archives
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Settings className="w-4 h-4 shrink-0" />
            Admin
          </NavLink>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-6 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
