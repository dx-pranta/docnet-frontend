import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService, uploadService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Camera, Upload, Shield } from 'lucide-react';

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialty: '',
    hospital: '',
    qualifications: '',
    yearsExperience: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        specialty: user.specialty || '',
        hospital: user.hospital || '',
        qualifications: (user.qualifications || []).join(', '),
        yearsExperience: user.yearsExperience?.toString() || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await userService.updateUser(user!.id, data);
      return res.data.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success('Profile updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    },
  });

  const [coverUploading, setCoverUploading] = useState(false);

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadRes = await uploadService.uploadImage(file);
      const avatar = uploadRes.data.data.url;
      const updateRes = await userService.updateUser(user!.id, { avatar });
      return updateRes.data.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success('Profile picture updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update photo');
    },
  });

  const handleCoverUpload = async (file: File) => {
    setCoverUploading(true);
    try {
      const uploadRes = await uploadService.uploadImage(file);
      const coverPhoto = uploadRes.data.data.url;
      const updateRes = await userService.updateUser(user!.id, { coverPhoto });
      setUser(updateRes.data.data);
      toast.success('Cover photo updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update cover photo');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      ...form,
      qualifications: form.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
      yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : null,
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-500">Manage your account settings and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div
            className="h-40 bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center"
            style={user.coverPhoto ? {
              backgroundImage: `url(${user.coverPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}}
          >
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg cursor-pointer hover:bg-white/30 transition-colors text-sm">
              {coverUploading ? 'Uploading...' : <><Camera className="w-4 h-4" /> Change Cover Photo</>}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={coverUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                  e.currentTarget.value = '';
                }}
              />
            </label>
          </div>
          <div className="p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Profile Photo</h2>
          <p className="text-sm text-slate-500 mb-4">Update your profile picture</p>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden border">
              {user.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 btn-secondary cursor-pointer">
                <Upload className="w-4 h-4" />
                {avatarMutation.isPending ? 'Uploading...' : 'Upload New Photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={avatarMutation.isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) avatarMutation.mutate(file);
                    e.currentTarget.value = '';
                  }}
                />
              </label>
              <p className="text-xs text-slate-400">JPG, PNG or WEBP. Max size 5MB</p>
            </div>
          </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Personal Information</h2>
          <p className="text-sm text-slate-500 mb-4">Update your personal details</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>

            <hr className="border-slate-200" />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
              <input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
              <input value={form.hospital} onChange={(e) => setForm({ ...form, hospital: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications</label>
              <input value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} className="input-field" placeholder="e.g. MBBS, FRACP, PhD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
              <input type="number" value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field min-h-24" />
              <p className="text-xs text-slate-400 mt-1">Brief description of your expertise and interests</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary disabled:opacity-50">
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-semibold text-slate-900 mb-1">AHPRA Verification</h2>
          <p className="text-sm text-slate-500 mb-4">Your verified professional credentials</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">AHPRA Registration Number</p>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded mt-1 inline-block text-slate-700">
                {user.ahpraId || 'Not provided'}
              </code>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
              <Shield className="w-3 h-3" /> Verified
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}