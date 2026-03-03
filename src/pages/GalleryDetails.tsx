import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaTrash, FaImages } from 'react-icons/fa';

export default function GalleryDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['gallery', id],
    queryFn: () => galleryService.getGallery(Number(id)),
  });

  const likeMutation = useMutation({
    mutationFn: (photoId: number) => galleryService.likePhoto(photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (photoId: number) => galleryService.deletePhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      setSelectedPhoto(null);
      toast.success('Photo deleted');
    },
  });

  const gallery = data?.data?.data;
  const isOwner = user?.id === gallery?.ownerId;

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!gallery) return <div className="text-center py-12">Gallery not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      <Link to="/galleries" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors mb-2">
        <span className="text-xl leading-none">&larr;</span> Back to Galleries
      </Link>

      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-50 to-blue-50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{gallery.title}</h1>
        {gallery.description && <p className="text-lg text-slate-600 mt-4 leading-relaxed max-w-3xl">{gallery.description}</p>}

        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <FaImages className="text-primary-500" />
            <span className="font-medium">{gallery.photos?.length || 0} photos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.photos?.map((photo: any) => (
          <div key={photo.id} className="relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-square bg-slate-100 cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
            <img
              src={photo.url}
              alt={photo.caption || ''}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              {photo.caption && <p className="text-white text-sm font-medium mb-3 line-clamp-2 shadow-sm">{photo.caption}</p>}
              <div className="flex items-center justify-between text-white">
                <button
                  onClick={(e) => { e.stopPropagation(); likeMutation.mutate(photo.id); }}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full transition-colors"
                >
                  {photo.likes?.includes(user?.id) ? <FaHeart className="text-rose-500 drop-shadow" /> : <FaRegHeart />}
                  <span className="font-medium text-sm">{photo.likes?.length || 0}</span>
                </button>
                {isOwner && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(photo.id); }}
                    className="p-2 bg-white/20 hover:bg-rose-500/80 backdrop-blur-md rounded-full transition-colors text-white"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {gallery.photos?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaImages className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No photos yet</h3>
          <p className="text-slate-500 mt-1">This gallery is currently empty.</p>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-[100] transition-all" onClick={() => setSelectedPhoto(null)}>
          <div className="max-w-5xl w-full p-4 md:p-8 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto.url} alt="" className="w-full max-h-[75vh] object-contain rounded-xl shadow-2xl" />

            <div className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 mt-6 flex flex-col items-center">
              {selectedPhoto.caption && <p className="text-white text-lg font-medium text-center mb-6">{selectedPhoto.caption}</p>}

              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => likeMutation.mutate(selectedPhoto.id)}
                  className="flex items-center gap-2 bg-white text-slate-900 px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-lg shadow-white/10"
                >
                  {selectedPhoto.likes?.includes(user?.id) ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
                  {selectedPhoto.likes?.length || 0} likes
                </button>
                {isOwner && (
                  <button
                    onClick={() => { deleteMutation.mutate(selectedPhoto.id); setSelectedPhoto(null); }}
                    className="flex items-center gap-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 border border-rose-500/30 px-6 py-2.5 rounded-xl font-medium transition-colors"
                  >
                    <FaTrash /> Delete Photo
                  </button>
                )}
                <button onClick={() => setSelectedPhoto(null)} className="px-6 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
