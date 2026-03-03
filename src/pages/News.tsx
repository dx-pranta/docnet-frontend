import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { newsService } from '../services/api';
import { FaNewspaper, FaEye, FaUser } from 'react-icons/fa';

export default function News() {
  const { data, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: () => newsService.getNews(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Medical News</h1>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {data?.data?.data?.map((article: any) => (
            <Link key={article.id} to={`/news/${article.id}`} className="card hover:shadow-lg transition-shadow">
              <div className="h-48 bg-primary-100 flex items-center justify-center">
                {article.featuredImage ? (
                  <img src={article.featuredImage} alt={article.title} className="w-full h-full object-cover" />
                ) : (
                  <FaNewspaper className="w-12 h-12 text-primary-400" />
                )}
              </div>
              <div className="p-6">
                <span className="text-xs font-medium text-primary-600 uppercase">{article.category}</span>
                <h3 className="font-semibold text-lg text-gray-900 mt-2">{article.title}</h3>
                <p className="text-gray-600 mt-2 line-clamp-2">{article.content?.substring(0, 150)}...</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <FaUser /> {article.author?.firstName} {article.author?.lastName}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaEye /> {article.viewCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data?.data?.data?.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">No news articles yet</div>
      )}
    </div>
  );
}
