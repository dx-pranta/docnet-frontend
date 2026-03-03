import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/api';
import { FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt, FaSearch } from 'react-icons/fa';

export default function Events() {
  const [filters, setFilters] = useState({ type: '', isPaid: '', search: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventService.getEvents(filters),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <Link to="/events/create" className="btn-primary">
          Create Event
        </Link>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="input-field pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          <select
            className="input-field w-auto"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="conference">Conference</option>
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="meetup">Meetup</option>
          </select>
          <select
            className="input-field w-auto"
            value={filters.isPaid}
            onChange={(e) => setFilters({ ...filters, isPaid: e.target.value })}
          >
            <option value="">All Events</option>
            <option value="false">Free</option>
            <option value="true">Paid</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {data?.data?.data?.map((event: any) => (
            <Link key={event.id} to={`/events/${event.id}`} className="card hover:shadow-lg transition-shadow">
              <div className="h-40 bg-primary-100 flex items-center justify-center">
                <FaCalendarAlt className="w-12 h-12 text-primary-400" />
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-primary-600 uppercase">
                  {event.eventType}
                </span>
                <h3 className="font-semibold text-lg text-gray-900 mt-1">{event.title}</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <FaCalendarAlt className="text-gray-400" />
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  {event.city && (
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {event.city}, {event.country}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <FaTicketAlt className="text-gray-400" />
                    {event.isPaid ? `$${event.price}` : 'Free'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.data?.data?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">No events found</div>
      )}
    </div>
  );
}
