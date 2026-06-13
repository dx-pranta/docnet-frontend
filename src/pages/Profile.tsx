import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userService, connectionService, uploadService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaLink, FaUserPlus, FaCheck } from 'react-icons/fa';
import {
  Briefcase, Building, GraduationCap, Users, Mail, Camera, Loader2, Shield,
} from 'lucide-react';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'about' | 'gallery'>('about');
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

  const avatarUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadResponse = await uploadService.uploadImage(file);
      const avatar = uploadResponse.data.data.url;
      const updateResponse = await userService.updateUser(Number(id), { avatar });
      return updateResponse.data.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (isOwnProfile && currentUser) {
        setUser({ ...currentUser, avatar: updatedUser.avatar });
      }
      toast.success('Profile picture updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile picture');
    },
  });

  const profile = data?.data?.data;
  const connections = connectionsData?.data?.data || [];
  const connectionsCount = isOwnProfile ? connections.length : connections.filter((c: any) => c.user.id === Number(id)).length;
  const isConnected = connections.some((c: any) => c.user.id === Number(id));

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!profile) return <div className="text-center py-12">User not found</div>;

  const tabs = [
    { key: 'about', label: 'About' },
    { key: 'gallery', label: 'Gallery' },
  ] as const;

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div
          className="h-48 bg-gradient-to-r from-primary-500 to-primary-700"
          style={profile.coverPhoto ? {
            backgroundImage: `url(${profile.coverPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : {}}
        />
        <div className="px-6 md:px-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-16">
            <div className="relative w-32 h-32 shrink-0">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white overflow-hidden flex items-center justify-center shadow-md">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary-600">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </span>
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-700 transition-colors">
                  {avatarUploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) avatarUploadMutation.mutate(file);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
              )}
            </div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-1">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  {profile.title && <span className="font-normal">{profile.title} </span>}
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.specialty && (
                  <p className="text-lg text-primary-600 font-medium">{profile.specialty}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                  {profile.hospital && (
                    <span className="flex items-center gap-1.5"><Building className="w-4 h-4" /> {profile.hospital}</span>
                  )}
                  {profile.yearsExperience != null && (
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {profile.yearsExperience} years experience</span>
                  )}
                  {profile.qualifications && profile.qualifications.length > 0 && (
                    <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {profile.qualifications.join(', ')}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-slate-700">{connectionsCount}</span> connections
                </div>
              </div>
              <div className="flex gap-3 shrink-0">
                {isOwnProfile && (
                  <Link to="/settings" className="btn-secondary">Edit Profile</Link>
                )}
                {!isOwnProfile && (
                  isConnected ? (
                    <button disabled className="btn-secondary flex items-center gap-2"><FaCheck /> Connected</button>
                  ) : (
                    <button onClick={() => sendRequestMutation.mutate()} className="btn-primary flex items-center gap-2"><FaUserPlus className="w-4 h-4" /> Connect</button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div className="mt-6 space-y-6">
            {profile.bio && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900 mb-3">About</h3>
                <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Professional Information</h3>
              <div className="space-y-4">
                {profile.hospital && (
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Hospital Affiliation</p>
                      <p className="text-sm text-slate-500">{profile.hospital}</p>
                    </div>
                  </div>
                )}
                {profile.qualifications && profile.qualifications.length > 0 && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Qualifications</p>
                      <p className="text-sm text-slate-500">{profile.qualifications.join(', ')}</p>
                    </div>
                  </div>
                )}
                {profile.yearsExperience != null && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Experience</p>
                      <p className="text-sm text-slate-500">{profile.yearsExperience} years in {profile.specialty || 'medicine'}</p>
                    </div>
                  </div>
                )}
                {profile.ahpraId && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">AHPRA Registration</p>
                      <p className="text-sm text-slate-500">
                        <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{profile.ahpraId}</code>
                        <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                          <Shield className="w-3 h-3" /> Verified
                        </span>
                      </p>
                    </div>
                  </div>
                )}
                {(profile.city || profile.country) && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900">Location</p>
                      <p className="text-sm text-slate-500">{profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}</p>
                    </div>
                  </div>
                )}
                {(profile.website || profile.linkedin) && (
                  <div className="flex items-start gap-3">
                    <FaLink className="w-5 h-5 text-slate-400 mt-1" />
                    <div>
                      <p className="font-medium text-slate-900">Links</p>
                      <div className="flex gap-3 mt-1">
                        {profile.website && (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">Website</a>
                        )}
                        {profile.linkedin && (
                          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">LinkedIn</a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="mt-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                    Photo {i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}