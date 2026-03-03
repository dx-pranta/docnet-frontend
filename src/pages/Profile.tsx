import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService, connectionService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaHospital, FaMapMarkerAlt, FaLink, FaUserPlus, FaCheck } from 'react-icons/fa';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const isOwnProfile = currentUser?.id === Number(id);

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(Number(id)),
  });

  const { data: connectionsData } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionService.getConnections(),
  });

  const sendRequestMutation = useMutation({
    mutationFn: () => connectionService.sendRequest(Number(id)),
    onSuccess: () => {
      toast.success('Connection request sent!');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const profile = data?.data?.data;
  const connections = connectionsData?.data?.data || [];
  const isConnected = connections.some((c: any) => c.user.id === Number(id));

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!profile) return <div className="text-center py-12">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700"></div>
        <div className="px-6 pb-6">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center -mt-12">
              <span className="text-3xl font-bold text-primary-600">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </span>
            </div>
            {!isOwnProfile && (
              isConnected ? (
                <button disabled className="btn-secondary flex items-center gap-2">
                  <FaCheck /> Connected
                </button>
              ) : (
                <button
                  onClick={() => sendRequestMutation.mutate()}
                  className="btn-primary flex items-center gap-2"
                >
                  <FaUserPlus /> Connect
                </button>
              )
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {profile.title} {profile.firstName} {profile.lastName}
          </h1>
          {profile.specialty && <p className="text-lg text-primary-600">{profile.specialty}</p>}

          {profile.bio && <p className="mt-4 text-gray-600">{profile.bio}</p>}

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {profile.hospital && (
              <p className="flex items-center gap-2 text-gray-600">
                <FaHospital className="text-gray-400" /> {profile.hospital}
              </p>
            )}
            {(profile.city || profile.country) && (
              <p className="flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt className="text-gray-400" /> {profile.city}, {profile.country}
              </p>
            )}
            {profile.qualifications?.length > 0 && (
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Qualifications:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.qualifications.map((q: string, i: number) => (
                    <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{q}</span>
                  ))}
                </div>
              </div>
            )}
            {(profile.website || profile.linkedin) && (
              <div className="col-span-2 flex gap-4">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                    <FaLink /> Website
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                    <FaLink /> LinkedIn
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
