import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Loader2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';

import { galleryService, uploadService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Galleries() {
  const { token, user } = useAuthStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [caption, setCaption] = useState('');
  const [blurSensitiveData, setBlurSensitiveData] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => galleryService.getGalleries(),
  });

  const createGalleryMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) {
        throw new Error('Gallery title is required');
      }

      const galleryResponse = await galleryService.createGallery({
        title,
        description,
        isPublic: true,
      });

      const galleryId = galleryResponse.data.data.id;

      if (selectedFiles.length > 0) {
        const uploadResponses = await Promise.all(selectedFiles.map((file) => uploadService.uploadImage(file, blurSensitiveData)));
        const urls = uploadResponses.map((response) => response.data.data.url);

        await galleryService.addPhotos(galleryId, urls, caption || undefined);
      }

      return galleryResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      setTitle('');
      setDescription('');
      setCaption('');
      setSelectedFiles([]);
      toast.success('Gallery created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create gallery');
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: (galleryId: number) => galleryService.deleteGallery(galleryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success('Gallery deleted');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete gallery');
    },
  });

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <section className="hf-card">
        <div className="hf-card-content space-y-5">
          <div>
            <h1 className="text-3xl font-semibold text-ink-900">Photo Galleries</h1>
            <p className="text-ink-500 mt-2">Create a gallery and upload photos directly through Cloudinary-backed storage.</p>
          </div>

          {token ? (
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Gallery title"
              />
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field"
                placeholder="Optional caption for uploaded photos"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field md:col-span-2 min-h-[110px]"
                placeholder="Gallery description"
              />
              <label className="md:col-span-2 border border-dashed border-ink-300 rounded-2xl p-5 bg-white cursor-pointer hover:bg-ink-50 transition-colors">
                <div className="flex items-center gap-3 text-ink-600">
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Choose images to upload</span>
                </div>
                <p className="text-sm text-ink-500 mt-2">PNG, JPG, WEBP up to 5MB each</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                />
              </label>

              <label className="md:col-span-2 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={blurSensitiveData}
                  onChange={(e) => setBlurSensitiveData(e.target.checked)}
                  className="rounded border-ink-300"
                />
                <span className="text-sm text-ink-600">Blur faces in photos</span>
              </label>

              {selectedFiles.length > 0 && (
                <div className="md:col-span-2 text-sm text-ink-600 bg-ink-50 rounded-xl px-4 py-3">
                  {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'} selected: {selectedFiles.map((file) => file.name).join(', ')}
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => createGalleryMutation.mutate()}
                  disabled={createGalleryMutation.isPending}
                >
                  {createGalleryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {createGalleryMutation.isPending ? 'Uploading...' : 'Create Gallery'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-500">Login to create galleries and upload photos.</p>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="text-center py-12 text-ink-500">Loading galleries...</div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {data?.data?.data?.map((gallery: any) => (
            <div key={gallery.id} className="hf-card hover:shadow-lg transition-shadow overflow-hidden relative group">
              {user?.id === gallery.ownerId && (
                <button
                  type="button"
                  onClick={() => deleteGalleryMutation.mutate(gallery.id)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 text-rose-600 border border-rose-100 shadow-sm flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  title="Delete gallery"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              )}

              <Link to={`/galleries/${gallery.id}`} className="block">
                <div className="h-48 bg-ink-100 p-1">
                {(!gallery.photos || gallery.photos.length === 0) && (
                  <div className="h-full rounded-xl flex items-center justify-center text-ink-300 bg-ink-50">
                    <ImagePlus className="w-12 h-12" />
                  </div>
                )}

                {gallery.photos?.length === 1 && (
                  <div className="h-full">
                    <img src={gallery.photos[0].url} alt="" className="w-full h-full object-cover rounded-xl" />
                  </div>
                )}

                {gallery.photos?.length === 2 && (
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {gallery.photos.slice(0, 2).map((photo: any) => (
                      <img key={photo.id} src={photo.url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ))}
                  </div>
                )}

                {gallery.photos?.length === 3 && (
                  <div className="grid grid-cols-2 gap-1 h-full">
                    <img src={gallery.photos[0].url} alt="" className="w-full h-full object-cover rounded-lg row-span-2" />
                    <img src={gallery.photos[1].url} alt="" className="w-full h-full object-cover rounded-lg" />
                    <img src={gallery.photos[2].url} alt="" className="w-full h-full object-cover rounded-lg" />
                  </div>
                )}

                {gallery.photos?.length >= 4 && (
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {gallery.photos.slice(0, 4).map((photo: any) => (
                      <img key={photo.id} src={photo.url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ))}
                  </div>
                )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-ink-900">{gallery.title}</h3>
                  <p className="text-sm text-ink-500 mt-1">{gallery.photos?.length || 0} photos</p>
                  <p className="text-sm text-ink-500 mt-2">{gallery.owner?.firstName} {gallery.owner?.lastName}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {data?.data?.data?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-ink-500">No galleries yet</div>
      )}
    </div>
  );
}
