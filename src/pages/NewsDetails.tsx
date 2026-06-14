import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { newsService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FaEye, FaThumbsUp, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { Trash2 } from 'lucide-react';

export default function NewsDetails() {
  const { id } = useParams();
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [likesCount, setLikesCount] = useState<number | null>(null);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [reactionType, setReactionType] = useState<string | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSubmitComment = () => {
    const nextComment = comment.trim();

    if (!token) {
      toast.error('Please login to comment');
      return;
    }

    if (!nextComment) {
      toast.error('Comment cannot be empty');
      return;
    }

    commentMutation.mutate(nextComment);
  };

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
    mutationFn: (content: string) => newsService.addComment(Number(id), content),
    onSuccess: (response) => {
      setComment('');
      queryClient.setQueryData(['news-comments', id], (previous: any) => {
        const previousComments = previous?.data?.data || [];

        return {
          ...previous,
          data: {
            ...previous?.data,
            data: [response.data.data, ...previousComments],
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ['news-comments', id] });
      toast.success('Comment added!');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to add comment'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => newsService.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData(['news-comments', id], (previous: any) => {
        const previousComments = previous?.data?.data || [];

        return {
          ...previous,
          data: {
            ...previous?.data,
            data: previousComments.filter((commentItem: any) => commentItem.id !== commentId),
          },
        };
      });
      toast.success('Comment deleted');
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to delete comment'),
  });

  const article = data?.data?.data;

  // initialize local like state from fetched article
  React.useEffect(() => {
    if (article) {
      const count = article.likesCount ?? article.likes?.length ?? article.likedBy?.length ?? 0;
      const isLiked = typeof article.liked === 'boolean'
        ? article.liked
        : !!(article.likedBy && article.likedBy.some((u: any) => u.id === useAuthStore.getState().user?.id));

      // Current backend guarantees whether the article is liked, but not the current user's reaction type.
      // Default to a generic 'like' when a user has reacted so the UI remains actionable.
      const rType = isLiked ? 'like' : null;

      setLikesCount(count);
      setLiked(isLiked);
      setReactionType(rType);
    }
  }, [article]);

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!article) return <div className="text-center py-12">Article not found</div>;

  return (
    <div>
      <Link to="/news" className="text-primary-600 hover:underline mb-4 inline-block">← Back to News</Link>

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
          <button
            type="button"
            onClick={() => setSelectedImage(article.featuredImage)}
            className="block w-full mb-6"
          >
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-64 object-cover rounded-lg cursor-zoom-in"
            />
          </button>
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
                const isRemovingLike = prevLiked && prevType === 'like';
                const newType = isRemovingLike ? null : 'like';
                setLiked(!isRemovingLike);
                setLikesCount(isRemovingLike ? Math.max(0, prevCount - 1) : prevCount + 1);
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
              {likesCount ?? 0} {(likesCount ?? 0) === 1 ? 'like' : 'likes'}
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
                        const prevLiked = !!liked;
                        const prevType = reactionType;
                        const removing = prevLiked && prevType === r;
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
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitComment(); }} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field mb-2"
              placeholder="Write a comment..."
              rows={3}
            />
            <button type="submit" disabled={!comment.trim() || commentMutation.isPending} className="btn-primary">
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {commentsData?.data?.data?.map((c: any) => (
            <div key={c.id} className="border-b pb-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-xs text-primary-600">{c.author?.firstName?.[0]}</span>
                </div>
                <div>
                  <p className="font-medium">{c.author?.firstName} {c.author?.lastName}</p>
                  <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                </div>

                {(user?.id === c.authorId || user?.role === 'admin') && (
                  <button
                    type="button"
                    onClick={() => deleteCommentMutation.mutate(c.id)}
                    className="text-gray-400 hover:text-rose-600 transition-colors"
                    title="Delete comment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-700">{c.content}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && createPortal(
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-[100] transition-all p-4 md:p-8 overflow-y-auto" onClick={() => setSelectedImage(null)}>
          <div className="w-full min-h-full flex items-center justify-center py-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-5xl flex flex-col items-center">
              <img src={selectedImage} alt={article.title} className="w-full max-h-[68vh] object-contain rounded-2xl shadow-2xl bg-slate-950/20" />

              <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 mt-5 flex flex-col items-center shadow-xl">
                <p className="text-white text-lg font-medium text-center mb-5">{article.title}</p>

                <button onClick={() => setSelectedImage(null)} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
