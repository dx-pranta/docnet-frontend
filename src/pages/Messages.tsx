import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { FaPaperPlane } from 'react-icons/fa';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');

  const { data: conversationsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messageService.getConversations(),
  });

  const { data: messagesData, refetch } = useQuery({
    queryKey: ['messages', userId],
    queryFn: () => messageService.getMessages(Number(userId)),
    enabled: !!userId,
  });

  const sendMutation = useMutation({
    mutationFn: () => messageService.sendMessage(Number(userId), message),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', userId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      refetch();
    },
  });

  const conversations = conversationsData?.data?.data || [];
  const messages = messagesData?.data?.data || [];
  const selectedUserId = Number(userId);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        <div className="card overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          {conversations.length > 0 ? (
            <div>
              {conversations.map((conv: any) => (
                <Link
                  key={conv.user.id}
                  to={`/messages/${conv.user.id}`}
                  className={`p-4 flex items-center gap-3 border-b hover:bg-gray-50 ${selectedUserId === conv.user.id ? 'bg-primary-50' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 text-sm">{conv.user.firstName?.[0]}{conv.user.lastName?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.user.firstName} {conv.user.lastName}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage?.content}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="p-4 text-gray-500">No conversations yet</p>
          )}
        </div>

        <div className="md:col-span-2 card flex flex-col">
          {userId ? (
            <>
              <div className="p-4 border-b">
                <Link to={`/profile/${userId}`} className="font-semibold">
                  Chat with User #{userId}
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === user?.id ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs ${msg.senderId === user?.id ? 'text-primary-100' : 'text-gray-500'} mt-1`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); sendMutation.mutate(); }} className="p-4 border-t flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  disabled={!message || sendMutation.isPending}
                  className="btn-primary disabled:opacity-50"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
