import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  MapPin,
  MessageCircle,
  PlusCircle,
  Send,
  ThumbsUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { connectionService, eventService, newsService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  const { data: eventsData } = useQuery({
    queryKey: ['events', 'dashboard'],
    queryFn: () => eventService.getEvents({ limit: 6 }),
  });

  const { data: newsData } = useQuery({
    queryKey: ['news', 'dashboard'],
    queryFn: () => newsService.getNews({ limit: 5 }),
  });

  const { data: connectionsData } = useQuery({
    queryKey: ['connections', 'dashboard'],
    queryFn: () => connectionService.getConnections(),
  });

  const events = eventsData?.data?.data || [];
  const news = newsData?.data?.data || [];
  const connections = connectionsData?.data?.data || [];

  const suggestedConnections = useMemo(() => connections.slice(0, 3), [connections]);

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-3 space-y-6">
          <section className="hf-card">
            <div className="hf-card-content">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-ink-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
                <div>
                  <Link to={user ? `/profile/${user.id}` : '/dashboard'}>
                    <h3 className="font-semibold hover:text-secondary-700">Dr. {user?.firstName} {user?.lastName}</h3>
                  </Link>
                  <p className="text-sm text-ink-500">{user?.specialty || 'Medical Professional'}</p>
                </div>
                <div className="pt-2 border-t border-ink-200 space-y-1 text-sm text-ink-500">
                  <p className="inline-flex items-center gap-2"><MapPin className="w-4 h-4" /> Australia</p>
                </div>
                <div className="pt-2 border-t border-ink-200">
                  <Link to="/connections" className="inline-flex items-center gap-2 text-sm text-ink-700 hover:text-secondary-700">
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{connections.length}</span>
                    <span className="text-ink-500">Connections</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="hf-card">
            <div className="hf-card-content">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/galleries" className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-100">
                  <ImageIcon className="w-4 h-4 text-ink-500" />
                  <span>My Gallery</span>
                </Link>
                <Link to="/events" className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-100">
                  <Calendar className="w-4 h-4 text-ink-500" />
                  <span>Events</span>
                </Link>
                <Link to="/messages" className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-100">
                  <MessageCircle className="w-4 h-4 text-ink-500" />
                  <span>Messages</span>
                </Link>
              </div>
            </div>
          </section>
        </aside>

        <section className="xl:col-span-6 space-y-6">
          <section className="hf-card">
            <div className="hf-card-content">
              <div className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-ink-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
                <button type="button" className="flex-1 text-left px-4 py-3 rounded-xl bg-ink-100 hover:bg-ink-200 transition-colors text-ink-500">
                  Share an update with your network...
                </button>
              </div>
            </div>
          </section>

          {news.length > 0 ? (
            news.map((item: any) => (
              <article key={item.id} className="hf-card">
                <div className="hf-card-content space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0">
                      <span className="text-xs font-semibold text-secondary-700">{item.author?.firstName?.[0]}{item.author?.lastName?.[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink-800">{item.author?.firstName} {item.author?.lastName}</p>
                      <p className="text-sm text-ink-500">News update</p>
                    </div>
                  </div>

                  <Link to={`/news/${item.id}`}>
                    <h3 className="text-lg font-semibold text-ink-800 hover:text-secondary-700">{item.title}</h3>
                  </Link>
                  {item.summary && <p className="text-sm text-ink-600">{item.summary}</p>}

                  <div className="flex items-center gap-2 text-sm border-t border-b border-ink-200 py-2 text-ink-500">
                    <span>{item._count?.likes || 0} reactions</span>
                    <span>{item._count?.comments || 0} comments</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className="btn-secondary px-3 py-2 text-sm"><ThumbsUp className="w-4 h-4" /> Like</button>
                    <button type="button" className="btn-secondary px-3 py-2 text-sm"><Lightbulb className="w-4 h-4" /> Insightful</button>
                    <button type="button" className="btn-secondary px-3 py-2 text-sm"><Heart className="w-4 h-4" /> Support</button>
                  </div>

                  <div className="flex gap-2">
                    <input className="input-field text-sm" placeholder="Write a comment..." />
                    <button type="button" className="btn-primary px-4"><Send className="w-4 h-4" /></button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <section className="hf-card">
              <div className="hf-card-content text-center py-12">
                <p className="text-ink-500">No network updates yet.</p>
              </div>
            </section>
          )}
        </section>

        <aside className="xl:col-span-3 space-y-6">
          <section className="hf-card">
            <div className="hf-card-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Upcoming Events</h3>
                <Link to="/events" className="text-sm text-secondary-700 hover:underline">See all</Link>
              </div>
              <div className="space-y-3">
                {events.slice(0, 3).map((event: any) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="block p-3 rounded-lg hover:bg-ink-100">
                    <h4 className="text-sm font-semibold text-ink-800 line-clamp-2">{event.title}</h4>
                    <p className="text-xs text-ink-500 mt-1">{new Date(event.startDate).toLocaleDateString()}</p>
                    <p className="text-xs text-ink-500">{event.isPaid ? `$${event.price}` : 'Free'}</p>
                  </Link>
                ))}
                {events.length === 0 && <p className="text-sm text-ink-500">No events available.</p>}
              </div>
            </div>
          </section>

          <section className="hf-card">
            <div className="hf-card-content">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Suggested Connections</h3>
                <Link to="/connections" className="text-sm text-secondary-700 hover:underline">See all</Link>
              </div>
              <div className="space-y-4">
                {suggestedConnections.length > 0 ? (
                  suggestedConnections.map((conn: any) => (
                    <div key={conn.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-ink-700">{conn.user.firstName?.[0]}{conn.user.lastName?.[0]}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/profile/${conn.user.id}`} className="text-sm font-semibold text-ink-800 hover:text-secondary-700">
                          {conn.user.firstName} {conn.user.lastName}
                        </Link>
                        <p className="text-xs text-ink-500">{conn.user.specialty || 'Medical Professional'}</p>
                        <Link to={`/messages/${conn.user.id}`} className="inline-flex mt-2 text-xs btn-secondary px-2.5 py-1.5">
                          <PlusCircle className="w-3 h-3" /> Message
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-500">No suggestions right now.</p>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
