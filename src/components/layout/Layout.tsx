import { Bell, Calendar, CreditCard, GalleryHorizontal, Home, LogOut, MessageCircle, Shield, Users } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/connections', label: 'Connections', icon: Users },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/galleries', label: 'Gallery', icon: GalleryHorizontal },
  { to: '/payment', label: 'Payments', icon: CreditCard },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink-100 text-ink-800">
      <nav className="bg-white border-b border-ink-200 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 md:h-[72px] flex items-center justify-between gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-900 rounded-lg flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-display text-2xl font-semibold text-primary-900">DocNet</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-ink-100 text-primary-900' : 'text-ink-700 hover:bg-ink-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button className="hidden md:inline-flex p-2 rounded-lg hover:bg-ink-100 text-ink-600" type="button">
              <Bell className="w-5 h-5" />
            </button>
            {user && (
              <Link to={`/profile/${user.id}`} className="hidden sm:flex items-center gap-2 ml-1">
                <div className="w-9 h-9 rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center">
                  <span className="text-xs font-semibold text-ink-700">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                </div>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-ink-600 hover:bg-rose-50 hover:text-rose-600"
              title="Logout"
              type="button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="lg:hidden border-b border-ink-200 bg-white sticky top-16 md:top-[72px] z-40 overflow-x-auto">
        <div className="px-4 py-2 flex gap-2 min-w-max">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-primary-900 text-white' : 'bg-ink-50 text-ink-600'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
