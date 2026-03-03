import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { galleryService } from '../services/api';
import { FaImages, FaUser } from 'react-icons/fa';

export default function Galleries() {
  const { data, isLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: () => galleryService.getGalleries(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Photo Galleries</h1>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {data?.data?.data?.map((gallery: any) => (
            <Link key={gallery.id} to={`/galleries/${gallery.id}`} className="card hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-100 grid grid-cols-2 gap-1 p-1">
                {gallery.photos?.slice(0, 4).map((photo: any, i: number) => (
                  <img key={i} src={photo.url} alt="" className="w-full h-full object-cover rounded" />
                ))}
                {(!gallery.photos || gallery.photos.length === 0) && (
                  <div className="col-span-2 flex items-center justify-center">
                    <FaImages className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900">{gallery.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{gallery.photos?.length || 0} photos</p>
                <p className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                  <FaUser className="text-gray-400" />
                  {gallery.owner?.firstName} {gallery.owner?.lastName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.data?.data?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">No galleries yet</div>
      )}
    </div>
  );
}
