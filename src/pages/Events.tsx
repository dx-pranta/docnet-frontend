import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, DollarSign, MapPin, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { eventService } from '../services/api';

type FilterType = 'all' | 'free' | 'paid';

export default function Events() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['events', 'prototype', search],
    queryFn: () => eventService.getEvents({ search }),
  });

  const events = data?.data?.data || [];

  const filteredEvents = useMemo(() => {
    return events.filter((event: any) => {
      if (filter === 'free') return !event.isPaid;
      if (filter === 'paid') return !!event.isPaid;
      return true;
    });
  }, [events, filter]);

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-ink-900 mb-2">Events</h1>
          <p className="text-ink-500">Professional development and networking opportunities</p>
        </div>
        <Link to="/events/create" className="btn-secondary">Manage Events</Link>
      </div>

      <section className="hf-card mb-6">
        <div className="hf-card-content space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              className="input-field pl-10"
              placeholder="Search event title, location, or organizer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setFilter('all')} className={`hf-tab ${filter === 'all' ? 'hf-tab-active' : 'hf-tab-inactive'}`}>
              All Events
            </button>
            <button type="button" onClick={() => setFilter('free')} className={`hf-tab ${filter === 'free' ? 'hf-tab-active' : 'hf-tab-inactive'}`}>
              Free Events
            </button>
            <button type="button" onClick={() => setFilter('paid')} className={`hf-tab ${filter === 'paid' ? 'hf-tab-active' : 'hf-tab-inactive'}`}>
              Paid Events
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="hf-card">
          <div className="hf-card-content py-16 text-center text-ink-500">Loading events...</div>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event: any) => (
            <article key={event.id} className="hf-card overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-secondary-100 to-primary-100 flex items-center justify-center">
                <Calendar className="w-12 h-12 text-primary-700" />
              </div>
              <div className="hf-card-content space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {event.isPaid ? (
                        <span className="px-2 py-1 rounded-md bg-secondary-100 text-secondary-800 text-xs font-semibold inline-flex items-center gap-1">
                          <DollarSign className="w-3 h-3" /> ${event.price}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-semibold">Free</span>
                      )}
                      <span className="px-2 py-1 rounded-md border border-ink-200 text-ink-500 text-xs inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> {event.eventType || 'General'}
                      </span>
                    </div>
                    <Link to={`/events/${event.id}`}>
                      <h3 className="text-xl font-semibold text-ink-900 hover:text-secondary-700">{event.title}</h3>
                    </Link>
                  </div>
                </div>

                <p className="text-ink-500 text-sm line-clamp-2">{event.description || 'No description available.'}</p>

                <div className="space-y-2 text-sm text-ink-500">
                  <div className="inline-flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.city ? `${event.city}, ${event.country || ''}` : 'Location TBA'}</span>
                  </div>
                </div>

                <Link to={`/events/${event.id}`} className="btn-primary w-full">
                  View Details & Register
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredEvents.length === 0 && (
        <section className="hf-card mt-6">
          <div className="hf-card-content py-16 text-center text-ink-500">No events found.</div>
        </section>
      )}
    </div>
  );
}
