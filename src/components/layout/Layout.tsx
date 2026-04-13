import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { FaCalendarAlt, FaNewspaper, FaImages, FaUsers, FaComment, FaCreditCard, FaSignOutAlt, FaUser } from 'react-icons/fa';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent tracking-tight">
              DocNet
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <FaUser className="w-4 h-4" /> Dashboard
              </NavLink>
              <NavLink to="/events" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <FaCalendarAlt className="w-4 h-4" /> Events
              </NavLink>
              <NavLink to="/news" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <FaNewspaper className="w-4 h-4" /> News
              </NavLink>
              <NavLink to="/galleries" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <FaImages className="w-4 h-4" /> Galleries
              </NavLink>
              <NavLink to="/connections" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <FaUsers className="w-4 h-4" /> Connections
              </NavLink>
              <NavLink to="/messages" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <FaComment className="w-4 h-4" /> Messages
              </NavLink>
              <NavLink to="/payment" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                <FaCreditCard className="w-4 h-4" /> Payments
              </NavLink>
            </nav>

            {user && (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-500 font-medium">{user.specialty || 'Doctor'}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center border border-primary-100 shadow-sm">
                    <span className="text-primary-700 font-semibold text-xs text-center leading-none mt-0.5">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  title="Logout"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation (Scrollable horizontally) */}
      <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto overflow-y-hidden sticky top-16 z-40">
        <nav className="flex px-4 py-2 gap-2 min-w-max">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>
            <FaUser className="w-3.5 h-3.5" /> Dashboard
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>
            <FaCalendarAlt className="w-3.5 h-3.5" /> Events
          </NavLink>
          <NavLink to="/news" className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>
            <FaNewspaper className="w-3.5 h-3.5" /> News
          </NavLink>
          <NavLink to="/galleries" className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>
            <FaImages className="w-3.5 h-3.5" /> Galleries
          </NavLink>
          <NavLink to="/connections" className={({ isActive }) => `flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-xs ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600'}`}>
            <FaUsers className="w-3.5 h-3.5" /> Connections
          </NavLink>
        </nav>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
