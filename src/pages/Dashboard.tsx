import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { connectionService, eventService, newsService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { timeAgo } from '../utils/timeAgo';

export default function Dashboard() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const createPostMutation = useMutation({
    mutationFn: () => newsService.createNews({ title: postTitle, content: postContent, status: 'published' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news', 'dashboard'] });
      setShowCreatePost(false);
      setPostTitle('');
      setPostContent('');
      toast.success('Post created!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create post');
    },
  });

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
  const dashboardCommentsKey = ['news-comments-dashboard', news.map((item: any) => item.id).join(',')];

  const commentQueries = useQuery({
    queryKey: dashboardCommentsKey,
    queryFn: async () => {
      const entries = await Promise.all(
        news.map(async (item: any) => {
          const response = await newsService.getComments(item.id);
          return [item.id, response.data.data || []] as const;
        })
      );

      return Object.fromEntries(entries);
    },
    enabled: news.length > 0,
  });

  const suggestedConnections = useMemo(() => connections.slice(0, 3), [connections]);

  const reactionMutation = useMutation({
    mutationFn: ({ newsId, type }: { newsId: number; type: string }) => newsService.likeNews(newsId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news', 'dashboard'] });
    },
    onError: () => {
      toast.error('Failed to update reaction');
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ newsId, content }: { newsId: number; content: string }) => newsService.addComment(newsId, content),
    onSuccess: (response, variables) => {
      setCommentInputs((previous) => ({ ...previous, [variables.newsId]: '' }));
      queryClient.setQueryData(dashboardCommentsKey, (previous: any) => ({
        ...(previous || {}),
        [variables.newsId]: [response.data.data, ...((previous?.[variables.newsId] || []) as any[])],
      }));
      queryClient.invalidateQueries({ queryKey: ['news', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['news-comments', String(variables.newsId)] });
      queryClient.invalidateQueries({ queryKey: ['news-comments-dashboard'] });
      toast.success('Comment added!');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ commentId }: { newsId: number; commentId: number }) => newsService.deleteComment(commentId),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(dashboardCommentsKey, (previous: any) => ({
        ...(previous || {}),
        [variables.newsId]: ((previous?.[variables.newsId] || []) as any[]).filter((commentItem: any) => commentItem.id !== variables.commentId),
      }));
      queryClient.invalidateQueries({ queryKey: ['news-comments', String(variables.newsId)] });
      queryClient.invalidateQueries({ queryKey: ['news-comments-dashboard'] });
      toast.success('Comment deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete comment');
    },
  });

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <aside className="xl:col-span-3 space-y-6">
          <section className="hf-card">
            <div className="hf-card-content">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-semibold text-ink-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                  )}
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
                <div className="w-10 h-10 rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-ink-700">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="flex-1 text-left px-4 py-3 rounded-xl bg-ink-100 hover:bg-ink-200 transition-colors text-ink-500"
                  onClick={() => setShowCreatePost(true)}
                >
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
                      <p className="text-sm text-ink-500">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>

                  {item.featuredImage && (
                    <Link to={`/news/${item.id}`}>
                      <img src={item.featuredImage} alt="" className="w-full h-48 object-cover rounded-xl" />
                    </Link>
                  )}
                  <Link to={`/news/${item.id}`}>
                    <h3 className="text-lg font-semibold text-ink-800 hover:text-secondary-700">{item.title}</h3>
                  </Link>
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary-100 text-secondary-800 text-xs font-semibold">{item.category}</span>
                    )}
                    {item.tags?.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs text-ink-400">#{tag}</span>
                    ))}
                  </div>
                  {item.content && <p className="text-sm text-ink-600 line-clamp-3">{item.content}</p>}

                  <div className="flex items-center gap-2 text-sm border-t border-b border-ink-200 py-2 text-ink-500">
                    <span>{item.likesCount ?? item.likes?.length ?? item.likedBy?.length ?? 0} reactions</span>
                    <span>{(commentQueries.data?.[item.id]?.length ?? item._count?.comments) || 0} comments</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary px-3 py-2 text-sm"
                      onClick={() => {
                        if (!token) return toast.error('Please login to react');
                        reactionMutation.mutate({ newsId: item.id, type: 'like' });
                      }}
                    >
                      <ThumbsUp className="w-4 h-4" /> Like
                    </button>
                    <button
                      type="button"
                      className="btn-secondary px-3 py-2 text-sm"
                      onClick={() => {
                        if (!token) return toast.error('Please login to react');
                        reactionMutation.mutate({ newsId: item.id, type: 'insightful' });
                      }}
                    >
                      <Lightbulb className="w-4 h-4" /> Insightful
                    </button>
                    <button
                      type="button"
                      className="btn-secondary px-3 py-2 text-sm"
                      onClick={() => {
                        if (!token) return toast.error('Please login to react');
                        reactionMutation.mutate({ newsId: item.id, type: 'support' });
                      }}
                    >
                      <Heart className="w-4 h-4" /> Support
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      className="input-field text-sm"
                      placeholder="Write a comment..."
                      value={commentInputs[item.id] || ''}
                      onChange={(e) => setCommentInputs((previous) => ({ ...previous, [item.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const content = (commentInputs[item.id] || '').trim();
                          if (!token) return toast.error('Please login to comment');
                          if (!content) return;
                          commentMutation.mutate({ newsId: item.id, content });
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn-primary px-4"
                      onClick={() => {
                        const content = (commentInputs[item.id] || '').trim();
                        if (!token) return toast.error('Please login to comment');
                        if (!content) return toast.error('Comment cannot be empty');
                        commentMutation.mutate({ newsId: item.id, content });
                      }}
                      disabled={commentMutation.isPending && !!commentInputs[item.id]}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  {(commentQueries.data?.[item.id]?.length || 0) > 0 && (
                    <div className="space-y-3 border-t border-ink-200 pt-4">
                      {commentQueries.data?.[item.id]?.slice(0, 3).map((commentItem: any) => (
                        <div key={commentItem.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {commentItem.author?.avatar ? (
                              <img src={commentItem.author.avatar} alt={`${commentItem.author.firstName} ${commentItem.author.lastName}`} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-semibold text-ink-700">{commentItem.author?.firstName?.[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-ink-50 rounded-xl px-3 py-2">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium text-ink-800">{commentItem.author?.firstName} {commentItem.author?.lastName}</p>
                                  <p className="text-sm text-ink-600 break-words">{commentItem.content}</p>
                                </div>

                                {(user?.id === commentItem.authorId || user?.role === 'admin') && (
                                  <button
                                    type="button"
                                    onClick={() => deleteCommentMutation.mutate({ newsId: item.id, commentId: commentItem.id })}
                                    className="text-ink-400 hover:text-rose-600 transition-colors"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
      {showCreatePost && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 z-40" onClick={() => setShowCreatePost(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create Post</h2>
                <button onClick={() => setShowCreatePost(false)} className="p-1 rounded-lg hover:bg-ink-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="input-field"
                placeholder="Post title"
              />
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="input-field min-h-[120px]"
                placeholder="What's on your mind?"
              />
              <button
                onClick={() => createPostMutation.mutate()}
                disabled={!postTitle.trim() || !postContent.trim() || createPostMutation.isPending}
                className="btn-primary w-full disabled:opacity-50"
              >
                {createPostMutation.isPending ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
