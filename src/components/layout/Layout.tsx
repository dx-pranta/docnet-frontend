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
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 fixed h-full flex flex-col z-10 shadow-sm">
        <div className="p-6">
          <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-500 bg-clip-text text-transparent">
            DocNet
          </Link>
        </div>

        <nav className="px-4 space-y-1.5 flex-1 overflow-y-auto pt-2">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FaUser className="w-5 h-5" />
            Dashboard
          </NavLink>
          <NavLink to="/events" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FaCalendarAlt className="w-5 h-5" />
            Events
          </NavLink>
          <NavLink to="/news" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FaNewspaper className="w-5 h-5" />
            News
          </NavLink>
          <NavLink to="/galleries" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FaImages className="w-5 h-5" />
            Galleries
          </NavLink>
          <NavLink to="/connections" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FaUsers className="w-5 h-5" />
            Connections
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FaComment className="w-5 h-5" />
            Messages
          </NavLink>
          <NavLink to="/payment" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <FaCreditCard className="w-5 h-5" />
            Payments
          </NavLink>
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center border border-primary-100 shadow-sm">
                <span className="text-primary-700 font-semibold text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-500 truncate font-medium">{user.specialty || 'Doctor'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-red-600 hover:bg-red-50 py-2.5 rounded-xl transition-all duration-200 font-medium"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
