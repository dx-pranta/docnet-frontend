import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService, userService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FaUserPlus, FaCheck, FaTimes, FaUserMinus } from 'react-icons/fa';

export default function Connections() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: connectionsData } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionService.getConnections(),
  });

  const { data: requestsData } = useQuery({
    queryKey: ['connection-requests'],
    queryFn: () => connectionService.getRequests(),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  });

  const sendRequestMutation = useMutation({
    mutationFn: (id: number) => connectionService.sendRequest(id),
    onSuccess: () => {
      toast.success('Connection request sent!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to send request'),
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => connectionService.respondToRequest(id, status),
    onSuccess: () => {
      toast.success('Request updated!');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connection-requests'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => connectionService.removeConnection(id),
    onSuccess: () => {
      toast.success('Connection removed');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  const connections = connectionsData?.data?.data || [];
  const requests = requestsData?.data?.data || [];
  const allUsers = usersData?.data?.data || [];
  
  const connectedUserIds = connections.map((c: any) => c.user.id);
  const pendingRequestIds = requests.map((r: any) => r.requesterId);
  const availableUsers = allUsers.filter((u: any) => 
    u.id !== user?.id && 
    !connectedUserIds.includes(u.id) && 
    !pendingRequestIds.includes(u.id)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Connections</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Connections ({connections.length})</h2>
          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((conn: any) => (
                <div key={conn.id} className="card p-4 flex items-center justify-between">
                  <Link to={`/profile/${conn.user.id}`} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">{conn.user.firstName?.[0]}{conn.user.lastName?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{conn.user.firstName} {conn.user.lastName}</p>
                      <p className="text-sm text-gray-500">{conn.user.specialty || conn.user.title}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeMutation.mutate(conn.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FaUserMinus />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No connections yet</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Requests ({requests.length})</h2>
          {requests.length > 0 ? (
            <div className="space-y-4 mb-8">
              {requests.map((req: any) => (
                <div key={req.id} className="card p-4 flex items-center justify-between">
                  <Link to={`/profile/${req.requester.id}`} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">{req.requester.firstName?.[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{req.requester.firstName} {req.requester.lastName}</p>
                      <p className="text-sm text-gray-500">{req.requester.specialty}</p>
                    </div>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respondMutation.mutate({ id: req.id, status: 'accepted' })}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => respondMutation.mutate({ id: req.id, status: 'rejected' })}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-8">No pending requests</p>
          )}

          <h2 className="text-xl font-semibold mb-4">Find Doctors</h2>
          <div className="space-y-3">
            {availableUsers.slice(0, 5).map((u: any) => (
              <div key={u.id} className="card p-4 flex items-center justify-between">
                <Link to={`/profile/${u.id}`} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 text-sm">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-500">{u.specialty}</p>
                  </div>
                </Link>
                <button
                  onClick={() => sendRequestMutation.mutate(u.id)}
                  className="text-primary-600 hover:bg-primary-50 p-2 rounded"
                >
                  <FaUserPlus />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
