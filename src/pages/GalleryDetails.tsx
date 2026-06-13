import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { galleryService, uploadService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FaHeart, FaRegHeart, FaTrash, FaImages, FaUpload } from 'react-icons/fa';

export default function GalleryDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [blurSensitiveData, setBlurSensitiveData] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['gallery', id],
    queryFn: () => galleryService.getGallery(Number(id)),
  });

  const likeMutation = useMutation({
    mutationFn: (photoId: number) => galleryService.likePhoto(photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gallery', id] }),
  });

  const addPhotosMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadResponses = await Promise.all(
        files.map((file) => uploadService.uploadImage(file, blurSensitiveData))
      );
      const urls = uploadResponses.map((r) => r.data.data.url);
      await galleryService.addPhotos(gallery.id, urls);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      toast.success('Photos added');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add photos');
    },
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

          {isOwner && (
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blurSensitiveData}
                  onChange={(e) => setBlurSensitiveData(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-xs text-slate-500">Blur faces</span>
              </label>
              <label className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer hover:bg-primary-700 transition-colors">
                <FaUpload className="w-3.5 h-3.5" />
                {addPhotosMutation.isPending ? 'Uploading...' : 'Add Photos'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={addPhotosMutation.isPending}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      addPhotosMutation.mutate(files);
                    }
                    e.currentTarget.value = '';
                  }}
                />
              </label>
            </div>
          )}
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

      {selectedPhoto && createPortal(
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center z-[100] transition-all p-4 md:p-8 overflow-y-auto" onClick={() => setSelectedPhoto(null)}>
          <div className="w-full min-h-full flex items-center justify-center py-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-5xl flex flex-col items-center">
              <img src={selectedPhoto.url} alt="" className="w-full max-h-[68vh] object-contain rounded-2xl shadow-2xl bg-slate-950/20" />

              <div className="w-full max-w-2xl bg-slate-800/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 md:p-6 mt-5 flex flex-col items-center shadow-xl">
                {selectedPhoto.caption && <p className="text-white text-lg font-medium text-center mb-5">{selectedPhoto.caption}</p>}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => likeMutation.mutate(selectedPhoto.id)}
                    className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-lg shadow-white/10"
                  >
                    {selectedPhoto.likes?.includes(user?.id) ? <FaHeart className="text-rose-500" /> : <FaRegHeart />}
                    {selectedPhoto.likes?.length || 0} likes
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => { deleteMutation.mutate(selectedPhoto.id); setSelectedPhoto(null); }}
                      className="flex items-center gap-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 border border-rose-500/30 px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <FaTrash /> Delete Photo
                    </button>
                  )}
                  <button onClick={() => setSelectedPhoto(null)} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
