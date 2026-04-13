import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { connectionService, userService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { FaUserPlus, FaCheck, FaTimes, FaUserMinus, FaUserFriends, FaInbox, FaSearch, FaUserClock } from 'react-icons/fa';

export default function Connections() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'connections' | 'requests' | 'discover'>('connections');

  const { data: connectionsData } = useQuery({
    queryKey: ['connections'],
    queryFn: () => connectionService.getConnections(),
  });

  const { data: requestsData } = useQuery({
    queryKey: ['connection-requests'],
    queryFn: () => connectionService.getRequests(),
  });

  const { data: sentRequestsData } = useQuery({
    queryKey: ['sent-connection-requests'],
    queryFn: () => connectionService.getSentRequests(),
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
      queryClient.invalidateQueries({ queryKey: ['sent-connection-requests'] });
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
      toast.success('Action successful');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['sent-connection-requests'] });
    },
  });

  const connections = connectionsData?.data?.data || [];
  const requests = requestsData?.data?.data || [];
  const sentRequests = sentRequestsData?.data?.data || [];
  const allUsers = usersData?.data?.data || [];

  const connectedUserIds = connections.map((c: any) => c.user.id);
  const pendingRequestIds = requests.map((r: any) => r.requesterId);
  const sentRequestUserIds = sentRequests.map((r: any) => r.recipientId);

  const availableUsers = allUsers.filter((u: any) =>
    u.id !== user?.id &&
    !connectedUserIds.includes(u.id) &&
    !pendingRequestIds.includes(u.id) &&
    !sentRequestUserIds.includes(u.id)
  );

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Connections</h1>
          <p className="text-slate-500 mt-1">Manage your professional network and discover new colleagues.</p>
        </div>
      </div>

      <div className="mb-8 border-b border-slate-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('connections')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'connections' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <FaUserFriends className="w-4 h-4" />
              My Connections
              <span className={`py-0.5 px-2 rounded-full text-xs ${activeTab === 'connections' ? 'bg-primary-100' : 'bg-slate-100 text-slate-600'}`}>{connections.length}</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'requests' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <FaInbox className="w-4 h-4" />
              Requests
              {(requests.length > 0 || sentRequests.length > 0) && (
                <span className={`py-0.5 px-2 rounded-full text-xs ${activeTab === 'requests' ? 'bg-primary-100' : 'bg-rose-100 text-rose-600'}`}>{requests.length + sentRequests.length}</span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'discover' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            <div className="flex items-center gap-2">
              <FaSearch className="w-4 h-4" />
              Discover
            </div>
          </button>
        </nav>
      </div>

      <div className="min-h-[400px]">
        {/* MY CONNECTIONS TAB */}
        {activeTab === 'connections' && (
          <div>
            {connections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((conn: any) => (
                  <div key={conn.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                    <Link to={`/profile/${conn.user.id}`} className="mb-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-blue-50 flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-105 transition-transform">
                        <span className="text-xl text-primary-600 font-bold">{conn.user.firstName?.[0]}{conn.user.lastName?.[0]}</span>
                      </div>
                    </Link>
                    <Link to={`/profile/${conn.user.id}`}>
                      <h3 className="font-bold text-slate-900 text-lg hover:text-primary-600 transition-colors">{conn.user.firstName} {conn.user.lastName}</h3>
                    </Link>
                    <p className="text-sm text-slate-500 font-medium mb-6">{conn.user.specialty || conn.user.title || 'Doctor'}</p>
                    <button
                      onClick={() => removeMutation.mutate(conn.id)}
                      className="mt-auto w-full py-2.5 rounded-xl font-medium text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaUserMinus className="w-4 h-4" /> Remove Connection
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUserFriends className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No connections yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Start building your professional network by discovering and connecting with other medical professionals.</p>
                <button onClick={() => setActiveTab('discover')} className="btn-primary">
                  Find Doctors
                </button>
              </div>
            )}
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 text-amber-600 p-2 rounded-lg"><FaInbox className="w-5 h-5" /></div>
                <h2 className="text-xl font-bold text-slate-900">Received Requests ({requests.length})</h2>
              </div>

              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req: any) => (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                      <Link to={`/profile/${req.requester.id}`} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100/50">
                          <span className="text-amber-600 font-bold">{req.requester.firstName?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{req.requester.firstName} {req.requester.lastName}</p>
                          <p className="text-sm text-slate-500 font-medium">{req.requester.specialty || 'Doctor'}</p>
                        </div>
                      </Link>
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondMutation.mutate({ id: req.id, status: 'accepted' })}
                          className="w-10 h-10 flex items-center justify-center bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/30"
                          title="Accept"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => respondMutation.mutate({ id: req.id, status: 'rejected' })}
                          className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors"
                          title="Decline"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-100/50">
                  <p className="text-slate-500 font-medium">You have no pending requests.</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FaUserClock className="w-5 h-5" /></div>
                <h2 className="text-xl font-bold text-slate-900">Sent Requests ({sentRequests.length})</h2>
              </div>

              {sentRequests.length > 0 ? (
                <div className="space-y-4">
                  {sentRequests.map((req: any) => (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                      <Link to={`/profile/${req.recipient.id}`} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100/50">
                          <span className="text-blue-600 font-bold">{req.recipient.firstName?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{req.recipient.firstName} {req.recipient.lastName}</p>
                          <p className="text-sm text-slate-500 font-medium">Pending response</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => removeMutation.mutate(req.id)}
                        className="text-sm font-medium px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-100/50">
                  <p className="text-slate-500 font-medium">No sent requests.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DISCOVER TAB */}
        {activeTab === 'discover' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableUsers.map((u: any) => (
                <div key={u.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group">
                  <Link to={`/profile/${u.id}`} className="mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-105 transition-transform">
                      <span className="text-xl text-slate-400 font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</span>
                    </div>
                  </Link>
                  <Link to={`/profile/${u.id}`}>
                    <h3 className="font-bold text-slate-900 text-lg hover:text-primary-600 transition-colors">{u.firstName} {u.lastName}</h3>
                  </Link>
                  <p className="text-sm text-slate-500 font-medium mb-6">{u.specialty || u.title || 'Doctor'}</p>
                  <button
                    onClick={() => sendRequestMutation.mutate(u.id)}
                    className="mt-auto w-full py-2.5 rounded-xl font-medium text-primary-700 bg-primary-50 hover:bg-primary-600 hover:text-white transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <FaUserPlus className="w-4 h-4" /> Connect
                  </button>
                </div>
              ))}

              {availableUsers.length === 0 && (
                <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">You're completely connected!</h3>
                  <p className="text-slate-500 max-w-md mx-auto">There are no more doctors available to connect with right now. Check back later as more professionals join.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
