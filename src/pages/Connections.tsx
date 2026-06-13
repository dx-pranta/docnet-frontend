import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserPlus, UserX, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { connectionService, userService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Connections() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'my-connections' | 'pending' | 'browse'>('my-connections');
  const [searchQuery, setSearchQuery] = useState('');

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

  const connectedUserIds = connections.map((connection: any) => connection.user.id);
  const pendingRequestIds = requests.map((request: any) => request.requesterId);
  const sentRequestUserIds = sentRequests.map((request: any) => request.recipientId);

  const availableUsers = allUsers.filter(
    (candidate: any) =>
      candidate.id !== user?.id &&
      !connectedUserIds.includes(candidate.id) &&
      !pendingRequestIds.includes(candidate.id) &&
      !sentRequestUserIds.includes(candidate.id)
  );

  const filterBySearch = (list: any[], mapText: (item: any) => string) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.filter((item) => mapText(item).toLowerCase().includes(query));
  };

  const filteredConnections = useMemo(
    () => filterBySearch(connections, (item) => `${item.user.firstName} ${item.user.lastName} ${item.user.specialty || ''}`),
    [connections, searchQuery]
  );
  const filteredRequests = useMemo(
    () => filterBySearch(requests, (item) => `${item.requester.firstName} ${item.requester.lastName} ${item.requester.specialty || ''}`),
    [requests, searchQuery]
  );
  const filteredUsers = useMemo(
    () => filterBySearch(availableUsers, (item) => `${item.firstName} ${item.lastName} ${item.specialty || ''}`),
    [availableUsers, searchQuery]
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-2 text-ink-900">Connections</h1>
        <p className="text-ink-500">Connect with verified medical professionals across South Australia</p>
      </div>

      <section className="hf-card mb-6">
        <div className="hf-card-content">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              placeholder="Search by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('my-connections')}
          className={`hf-tab ${activeTab === 'my-connections' ? 'hf-tab-active' : 'hf-tab-inactive'}`}
        >
          My Connections ({connections.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`hf-tab ${activeTab === 'pending' ? 'hf-tab-active' : 'hf-tab-inactive'}`}
        >
          Pending ({requests.length + sentRequests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('browse')}
          className={`hf-tab ${activeTab === 'browse' ? 'hf-tab-active' : 'hf-tab-inactive'}`}
        >
          Browse Doctors
        </button>
      </div>

      {activeTab === 'my-connections' && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConnections.map((connection: any) => (
            <article key={connection.id} className="hf-card">
              <div className="hf-card-content flex gap-4">
                <Link to={`/profile/${connection.user.id}`}>
                  <div className="w-16 h-16 rounded-full bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                    <span className="font-semibold text-secondary-700">{connection.user.firstName?.[0]}{connection.user.lastName?.[0]}</span>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${connection.user.id}`}>
                    <h3 className="font-semibold hover:text-secondary-700">{connection.user.firstName} {connection.user.lastName}</h3>
                  </Link>
                  <p className="text-sm text-ink-500">{connection.user.specialty || 'Medical Professional'}</p>
                  <div className="flex gap-2 mt-3">
                    <Link to={`/profile/${connection.user.id}`} className="btn-secondary text-sm px-3 py-1.5">View Profile</Link>
                    <Link to={`/messages/${connection.user.id}`} className="btn-primary text-sm px-3 py-1.5">Message</Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {filteredConnections.length === 0 && (
            <section className="hf-card md:col-span-2">
              <div className="hf-card-content py-16 text-center text-ink-500">No connections found.</div>
            </section>
          )}
        </section>
      )}

      {activeTab === 'pending' && (
        <section className="space-y-4">
          {filteredRequests.map((request: any) => (
            <article key={request.id} className="hf-card">
              <div className="hf-card-content flex items-start gap-4">
                <Link to={`/profile/${request.requester.id}`}>
                  <div className="w-16 h-16 rounded-full bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                    <span className="font-semibold text-secondary-700">{request.requester.firstName?.[0]}{request.requester.lastName?.[0]}</span>
                  </div>
                </Link>
                <div className="flex-1">
                  <Link to={`/profile/${request.requester.id}`}>
                    <h3 className="font-semibold hover:text-secondary-700">{request.requester.firstName} {request.requester.lastName}</h3>
                  </Link>
                  <p className="text-sm text-ink-500">{request.requester.specialty || 'Medical Professional'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => respondMutation.mutate({ id: request.id, status: 'accepted' })}
                    className="btn-primary px-3 py-2"
                  >
                    <UserCheck className="w-4 h-4" /> Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => respondMutation.mutate({ id: request.id, status: 'rejected' })}
                    className="btn-secondary px-3 py-2"
                  >
                    <UserX className="w-4 h-4" /> Decline
                  </button>
                </div>
              </div>
            </article>
          ))}

          {sentRequests.length > 0 && (
            <section className="hf-card">
              <div className="hf-card-content">
                <h3 className="font-semibold mb-3">Sent Requests</h3>
                <div className="space-y-3">
                  {sentRequests.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-ink-200 bg-white">
                      <Link to={`/profile/${request.recipient.id}`} className="text-sm font-medium text-ink-800 hover:text-secondary-700">
                        {request.recipient.firstName} {request.recipient.lastName}
                      </Link>
                      <button type="button" onClick={() => removeMutation.mutate(request.id)} className="btn-secondary text-sm px-2.5 py-1.5">
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {filteredRequests.length === 0 && sentRequests.length === 0 && (
            <section className="hf-card">
              <div className="hf-card-content py-16 text-center text-ink-500">No pending connection requests.</div>
            </section>
          )}
        </section>
      )}

      {activeTab === 'browse' && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((candidate: any) => (
            <article key={candidate.id} className="hf-card">
              <div className="hf-card-content text-center">
                <Link to={`/profile/${candidate.id}`}>
                  <div className="w-20 h-20 mx-auto rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center">
                    <span className="font-semibold text-ink-700">{candidate.firstName?.[0]}{candidate.lastName?.[0]}</span>
                  </div>
                </Link>
                <Link to={`/profile/${candidate.id}`}>
                  <h3 className="font-semibold mt-3 hover:text-secondary-700">{candidate.firstName} {candidate.lastName}</h3>
                </Link>
                <p className="text-sm text-ink-500">{candidate.specialty || candidate.title || 'Medical Professional'}</p>
                <button
                  type="button"
                  className="btn-primary w-full mt-4"
                  onClick={() => sendRequestMutation.mutate(candidate.id)}
                >
                  <UserPlus className="w-4 h-4" /> Connect
                </button>
              </div>
            </article>
          ))}
          {filteredUsers.length === 0 && (
            <section className="hf-card lg:col-span-3">
              <div className="hf-card-content py-16 text-center text-ink-500">No doctors found.</div>
            </section>
          )}
        </section>
      )}
    </div>
  );
}
