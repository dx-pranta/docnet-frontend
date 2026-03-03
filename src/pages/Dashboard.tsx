import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { eventService, newsService, connectionService } from '../services/api';
import { FaCalendarAlt, FaNewspaper, FaUsers, FaImage, FaPlus } from 'react-icons/fa';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: eventsData } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventService.getEvents({ limit: 3 }),
  });

  const { data: newsData } = useQuery({
    queryKey: ['news', 'latest'],
    queryFn: () => newsService.getNews({ limit: 3 }),
  });

  const { data: connectionsData } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionService.getConnections(),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, Dr. {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.specialty ? `${user.specialty} - ` : ''}
          Here's what's happening in your network
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Link to="/events" className="card p-6 hover:shadow-md transition-shadow">
          <FaCalendarAlt className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Events</h3>
          <p className="text-2xl font-bold text-primary-600">{eventsData?.data?.total || 0}</p>
        </Link>
        <Link to="/news" className="card p-6 hover:shadow-md transition-shadow">
          <FaNewspaper className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Articles</h3>
          <p className="text-2xl font-bold text-primary-600">{newsData?.data?.total || 0}</p>
        </Link>
        <Link to="/connections" className="card p-6 hover:shadow-md transition-shadow">
          <FaUsers className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Connections</h3>
          <p className="text-2xl font-bold text-primary-600">{connectionsData?.data?.length || 0}</p>
        </Link>
        <Link to="/galleries" className="card p-6 hover:shadow-md transition-shadow">
          <FaImage className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Galleries</h3>
          <p className="text-2xl font-bold text-primary-600">-</p>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Link to="/events" className="text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="p-6">
            {eventsData?.data?.data?.length > 0 ? (
              <div className="space-y-4">
                {eventsData?.data?.data.map((event: any) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            )}
          </div>
          <div className="p-6 border-t">
            <Link to="/events/create" className="btn-primary flex items-center justify-center gap-2">
              <FaPlus /> Create Event
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Latest News</h2>
            <Link to="/news" className="text-primary-600 hover:underline">View All</Link>
          </div>
          <div className="p-6">
            {newsData?.data?.data?.length > 0 ? (
              <div className="space-y-4">
                {newsData?.data?.data.map((news: any) => (
                  <Link
                    key={news.id}
                    to={`/news/${news.id}`}
                    className="block p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-medium text-gray-900">{news.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      By {news.author?.firstName} {news.author?.lastName}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No news articles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
