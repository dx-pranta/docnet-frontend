import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import CreateEvent from './pages/CreateEvent';
import News from './pages/News';
import NewsDetails from './pages/NewsDetails';
import Galleries from './pages/Galleries';
import GalleryDetails from './pages/GalleryDetails';
import Connections from './pages/Connections';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import PaymentHistory from './pages/PaymentHistory';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/create" element={<PrivateRoute><CreateEvent /></PrivateRoute>} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetails />} />
        <Route path="/galleries" element={<Galleries />} />
        <Route path="/galleries/:id" element={<GalleryDetails />} />
        <Route path="/connections" element={<PrivateRoute><Connections /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/payment" element={<PrivateRoute><PaymentHistory /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}
