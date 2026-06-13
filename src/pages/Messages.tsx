import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreVertical, Search, Send } from 'lucide-react';

import { connectionService, messageService } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
  });

  const { data: connectionsData } = useQuery({
    queryKey: ['connections-for-messages'],
    queryFn: () => connectionService.getConnections(),
  });

  const selectedUserId = Number(userId);

  const { data: messagesData, refetch } = useQuery({
    queryKey: ['messages', selectedUserId],
    queryFn: () => messageService.getMessages(selectedUserId),
    enabled: !!selectedUserId,
  });

  const sendMutation = useMutation({
    mutationFn: () => messageService.sendMessage(selectedUserId, messageInput),
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      refetch();
    },
  });

  const conversations = conversationsData?.data?.data || [];
  const connections = connectionsData?.data?.data || [];
  const messages = messagesData?.data?.data || [];

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((conversation: any) => {
      const name = `${conversation.user.firstName} ${conversation.user.lastName}`.toLowerCase();
      const specialty = (conversation.user.specialty || '').toLowerCase();
      return name.includes(q) || specialty.includes(q);
    });
  }, [conversations, searchQuery]);

  const activeConversation = conversations.find((conversation: any) => conversation.user.id === selectedUserId);
  const selectedConnectionUser = connections.find((connection: any) => connection.user.id === selectedUserId)?.user;
  const selectedChatUser = activeConversation?.user || selectedConnectionUser;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-2 text-ink-900">Messages</h1>
        <p className="text-ink-500">Chat with your connections (verified doctors only)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        <section className="hf-card lg:col-span-4 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-ink-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                placeholder="Search messages..."
                className="input-field pl-9 py-2.5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation: any) => (
                <Link
                  key={conversation.user.id}
                  to={`/messages/${conversation.user.id}`}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-ink-100 transition-colors border-b border-ink-200 ${
                    selectedUserId === conversation.user.id ? 'bg-ink-100' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-secondary-700">{conversation.user.firstName?.[0]}{conversation.user.lastName?.[0]}</span>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-semibold">{conversation.unreadCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="font-semibold truncate text-ink-800">{conversation.user.firstName} {conversation.user.lastName}</h4>
                      <span className="text-xs text-ink-400 whitespace-nowrap">recent</span>
                    </div>
                    <p className="text-sm text-ink-500 truncate">{conversation.lastMessage?.content}</p>
                    <p className="text-xs text-ink-500 mt-1">{conversation.user.specialty || 'Medical Professional'}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-6 text-center text-ink-500 text-sm">No conversations found.</div>
            )}
          </div>

          {conversations.length === 0 && (
            <div className="p-4 border-t border-ink-200">
              <h3 className="text-sm font-semibold text-ink-700 mb-2">Start New Message</h3>
              {connections.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {connections.map((connection: any) => (
                    <Link
                      key={connection.id}
                      to={`/messages/${connection.user.id}`}
                      className="block text-sm px-3 py-2 rounded-lg hover:bg-ink-100"
                    >
                      {connection.user.firstName} {connection.user.lastName}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-500">Connect with users to start messaging.</p>
              )}
            </div>
          )}
        </section>

        <section className="hf-card lg:col-span-8 overflow-hidden flex flex-col">
          {selectedUserId && selectedChatUser ? (
            <>
              <div className="p-4 border-b border-ink-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <Link to={`/profile/${selectedUserId}`}>
                    <div className="w-10 h-10 rounded-full bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-secondary-700">{selectedChatUser.firstName?.[0]}{selectedChatUser.lastName?.[0]}</span>
                    </div>
                  </Link>
                  <div className="min-w-0">
                    <Link to={`/profile/${selectedUserId}`}>
                      <h3 className="font-semibold text-ink-900 hover:text-secondary-700 truncate">
                        {selectedChatUser.firstName} {selectedChatUser.lastName}
                      </h3>
                    </Link>
                    <p className="text-sm text-ink-500 truncate">{selectedChatUser.specialty || 'Medical Professional'}</p>
                  </div>
                </div>
                <button type="button" className="btn-secondary px-2.5 py-2">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {messages.length > 0 ? (
                  messages.map((message: any) => {
                    const isSent = message.senderId === user?.id;
                    return (
                      <div key={message.id} className={`flex gap-3 ${isSent ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-ink-100 border border-ink-200 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-semibold text-ink-700">
                            {isSent ? `${user?.firstName?.[0]}${user?.lastName?.[0]}` : `${selectedChatUser.firstName?.[0]}${selectedChatUser.lastName?.[0]}`}
                          </span>
                        </div>
                        <div className={`max-w-md ${isSent ? 'text-right' : ''}`}>
                          <div className={`inline-block max-w-full p-3 rounded-lg text-sm ${isSent ? 'bg-secondary-500 text-white' : 'bg-ink-100 text-ink-800'}`}>
                            {message.content}
                          </div>
                          <p className="text-xs text-ink-400 mt-1">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full min-h-[280px] flex items-center justify-center text-sm text-ink-500">
                    No messages yet. Start the conversation below.
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-ink-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMutation.mutate();
                  }}
                  className="flex gap-3"
                >
                  <input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="input-field flex-1"
                  />
                  <button type="submit" className="btn-primary px-4" disabled={!messageInput.trim() || sendMutation.isPending}>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-xs text-ink-500 mt-2">Messages are restricted to verified connections only.</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-ink-500 px-6 text-center">
              Select a conversation to start messaging.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
