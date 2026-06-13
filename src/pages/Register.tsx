import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Shield, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { authService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  specialty: z.string().optional(),
  hospital: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const nextStep = async () => {
    if (step === 1) {
      const valid = await trigger(['firstName', 'lastName', 'email', 'password']);
      if (!valid) return;
    }
    if (step < 4) setStep((previous) => previous + 1);
  };

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      setAuth(response.data.token, response.data.user);
      toast.success('Account created! Check your email for the verification code.');
      navigate('/verify-email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const values = getValues();

  return (
    <div className="min-h-screen bg-ink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-primary-900 rounded-xl mb-3">
            <Shield className="w-8 h-8 text-white" />
          </Link>
          <h1 className="text-2xl font-semibold text-primary-900">Create Your DocNet Account</h1>
        </div>

        <section className="hf-card">
          <div className="hf-card-content">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink-900">
                Step {step} of 4: {step === 1 && 'Personal Details'}
                {step === 2 && 'Professional Details'}
                {step === 3 && 'Profile Photo'}
                {step === 4 && 'Review & Submit'}
              </h2>
              {step > 1 && (
                <button type="button" className="btn-secondary px-3 py-1.5 text-sm" onClick={() => setStep(step - 1)}>
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
            </div>

            <div className="w-full h-2 rounded-full bg-ink-100 overflow-hidden mb-6">
              <div className="h-full bg-primary-900 transition-all" style={{ width: `${(step / 4) * 100}%` }} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">First Name</label>
                      <input {...register('firstName')} className="input-field" />
                      {errors.firstName && <p className="text-sm text-rose-500 mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1">Last Name</label>
                      <input {...register('lastName')} className="input-field" />
                      {errors.lastName && <p className="text-sm text-rose-500 mt-1">{errors.lastName.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Email Address</label>
                    <input {...register('email')} type="email" className="input-field" />
                    {errors.email && <p className="text-sm text-rose-500 mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Password</label>
                    <input {...register('password')} type="password" className="input-field" />
                    {errors.password && <p className="text-sm text-rose-500 mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
                    <input {...register('title')} placeholder="Dr." className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Specialty</label>
                    <input {...register('specialty')} placeholder="Cardiology" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Hospital / Clinic Affiliation</label>
                    <input {...register('hospital')} placeholder="Royal Adelaide Hospital" className="input-field" />
                  </div>
                  <p className="text-xs text-ink-500">Professional details strengthen profile trust and discovery.</p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-ink-100 border-2 border-dashed border-ink-300 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-ink-400" />
                  </div>
                  <button type="button" className="btn-secondary">
                    <Upload className="w-4 h-4" /> Upload Profile Photo
                  </button>
                  <p className="text-sm text-ink-500">Profile photo upload is optional and can be completed later in profile settings.</p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-ink-100 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-primary-900">Personal Information</h3>
                    <p className="text-sm text-ink-600">Name: {values.firstName} {values.lastName}</p>
                    <p className="text-sm text-ink-600">Email: {values.email}</p>
                  </div>
                  <div className="bg-ink-100 p-4 rounded-lg space-y-2">
                    <h3 className="font-semibold text-primary-900">Professional Information</h3>
                    <p className="text-sm text-ink-600">Title: {values.title || 'Not provided'}</p>
                    <p className="text-sm text-ink-600">Specialty: {values.specialty || 'Not provided'}</p>
                    <p className="text-sm text-ink-600">Hospital: {values.hospital || 'Not provided'}</p>
                  </div>
                  <div className="bg-secondary-50 border border-secondary-100 p-4 rounded-lg text-sm text-ink-700">
                    Your registration will proceed through the AHPRA-aligned verification workflow before full account access.
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                {step < 4 ? (
                  <>
                    <button type="button" className="btn-secondary flex-1" onClick={() => navigate('/')}>
                      Cancel
                    </button>
                    <button type="button" className="btn-primary flex-1" onClick={nextStep}>
                      Continue
                    </button>
                  </>
                ) : (
                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <p className="text-center text-sm text-ink-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary-700 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
