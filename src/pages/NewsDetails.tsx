import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { newsService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FaEye, FaThumbsUp, FaUser, FaCalendarAlt } from 'react-icons/fa';

export default function NewsDetails() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [reactionType, setReactionType] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['news', id],
    queryFn: () => newsService.getNewsItem(Number(id)),
  });

  const { data: commentsData } = useQuery({
    queryKey: ['news-comments', id],
    queryFn: () => newsService.getComments(Number(id)),
  });

  const likeMutation = useMutation({
    mutationFn: (vars?: { type?: string }) => newsService.likeNews(Number(id), vars?.type),
    // optimistic UI handled in onMutate; refetch to sync
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news', id] }),
    onError: () => {
      toast.error('Failed to update reaction');
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => newsService.addComment(Number(id), comment),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['news-comments', id] });
      toast.success('Comment added!');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const article = data?.data?.data;

  // initialize local like state from fetched article
  React.useEffect(() => {
    if (article) {
      // backend may return likes (array) or likesCount and liked
      const count = article.likes?.length ?? article.likesCount ?? 0;
      const isLiked = typeof article.liked === 'boolean' ? article.liked : !!(article.likedBy && article.likedBy.some((u: any) => u.id === useAuthStore.getState().user?.id));
      // if backend includes a type for the current user's like, set reactionType
      const currentUserId = useAuthStore.getState().user?.id;
      let rType = null;
      if (article.likes && currentUserId) {
        const me = article.likes.find((u: any) => u.id === currentUserId);
        rType = me?.NewsLike?.type ?? me?.type ?? null;
      }
      if (article.liked && article.likes?.length) {
        // fallback: if liked and likes array available, try to infer type
        rType = rType ?? null;
      }
      setLikesCount(count);
      setLiked(isLiked);
      setReactionType(rType);
    }
  }, [article]);

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!article) return <div className="text-center py-12">Article not found</div>;

  return (
    <div>
      <Link to="/news" className="text-primaryunderline mb-4 inline-block">← Back to News-600 hover:</Link>

      <article className="card p-8 overflow-visible">
        <div className="mb-6">
          <span className="text-sm font-medium text-primary-600 uppercase">{article.category}</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{article.title}</h1>
          <div className="mt-4 flex items-center gap-6 text-gray-500">
            <span className="flex items-center gap-2"><FaUser /> {article.author?.firstName} {article.author?.lastName}</span>
            <span className="flex items-center gap-2"><FaCalendarAlt /> {new Date(article.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><FaEye /> {article.viewCount} views</span>
          </div>
        </div>

        {article.featuredImage && (
          <img src={article.featuredImage} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6" />
        )}

        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />

        <div className="mt-8 pt-6 border-t flex items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!token) return toast.error('Please login to react');
                // optimistic update for simple like toggling
                if (liked === null || likesCount === null) return likeMutation.mutate({ type: 'like' });
                const prevLiked = liked;
                const prevCount = likesCount;
                const prevType = reactionType;
                // clicking thumbs sets type 'like'
                const newType = prevLiked && prevType === 'like' ? null : 'like';
                setLiked(!prevLiked || newType !== null);
                setLikesCount(prevLiked && prevType === 'like' ? Math.max(0, prevCount - 1) : prevCount + 1);
                setReactionType(newType);
                likeMutation.mutate({ type: 'like' }, {
                  onError: () => {
                    setLiked(prevLiked);
                    setLikesCount(prevCount);
                    setReactionType(prevType);
                  },
                });
              }}
              aria-pressed={!!liked}
              className={`flex items-center gap-2 ${reactionType === 'like' ? 'text-primary-600' : 'text-gray-600'} hover:text-primary-600`}
            >
              <FaThumbsUp className={reactionType === 'like' ? 'text-primary-600' : ''} />
              {likesCount ?? 0} { (likesCount ?? 0) === 1 ? 'like' : 'likes'}
            </button>

            {/* Reaction palette (simple) */}
            <div className="relative">
              <button
                onClick={() => setShowPalette((s) => !s)}
                aria-haspopup="true"
                aria-expanded={showPalette}
                className="p-2 rounded-md bg-gray-100 hover:bg-gray-200"
              >
                😀
              </button>

              {showPalette && (
                <div className="absolute left-0 mt-2 bg-white border rounded-md shadow-md p-2 flex gap-2 z-50 min-w-[180px]">
                  {['like', 'love', 'laugh', 'surprised', 'sad'].map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setShowPalette(false);
                        if (!token) return toast.error('Please login to react');
                        const prevCount = likesCount ?? 0;
                        const prevType = reactionType;
                        // if same type, remove
                        const removing = prevType === r;
                        setReactionType(removing ? null : r);
                        setLiked(!removing);
                        setLikesCount(removing ? Math.max(0, prevCount - 1) : prevCount + 1);
                        likeMutation.mutate({ type: r }, {
                          onError: () => {
                            setReactionType(prevType);
                            setLiked(!!prevType);
                            setLikesCount(prevCount);
                          },
                        });
                      }}
                      className={`px-2 py-1 rounded ${reactionType === r ? 'bg-primary-100' : 'hover:bg-gray-100'}`}
                    >
                      {r === 'like' ? '👍' : r === 'love' ? '❤️' : r === 'laugh' ? '😂' : r === 'surprised' ? '😮' : '😢'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      <div className="mt-8 card p-6">
        <h2 className="text-xl font-semibold mb-4">Comments ({commentsData?.data?.data?.length || 0})</h2>
        
        {token && (
          <form onSubmit={(e) => { e.preventDefault(); commentMutation.mutate(); }} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field mb-2"
              placeholder="Write a comment..."
              rows={3}
            />
            <button type="submit" disabled={!comment || commentMutation.isPending} className="btn-primary">
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {commentsData?.data?.data?.map((c: any) => (
            <div key={c.id} className="border-b pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs text-primary-600">{c.author?.firstName?.[0]}</span>
                </div>
                <div>
                  <p className="font-medium">{c.author?.firstName} {c.author?.lastName}</p>
                  <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-gray-700">{c.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
