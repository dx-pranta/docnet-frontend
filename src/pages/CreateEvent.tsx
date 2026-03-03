import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { eventService } from '../services/api';
import toast from 'react-hot-toast';

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  isPaid: boolean;
  isOnline: boolean;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  price: string;
  venue: string;
  capacity: string;
  city: string;
  country: string;
  meetingLink: string;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      eventType: 'conference',
      isPaid: false,
      isOnline: false,
      currency: 'USD',
      status: 'published',
    }
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const eventData = {
        ...data,
        price: data.isPaid ? Number(data.price) : 0,
        capacity: data.capacity ? Number(data.capacity) : null,
      };
      const response = await eventService.createEvent(eventData);
      toast.success('Event created!');
      navigate(`/events/${response.data.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Event</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
          <input {...register('title', { required: true })} className="input-field" />
          {errors.title && <p className="text-red-500 text-sm">Title is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea {...register('description', { required: true })} className="input-field" rows={4} />
          {errors.description && <p className="text-red-500 text-sm">Description is required</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <select {...register('eventType')} className="input-field">
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="meetup">Meetup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="input-field">
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input type="datetime-local" {...register('startDate', { required: true })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="datetime-local" {...register('endDate')} className="input-field" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isOnline')} className="rounded" />
            <span>Online Event</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('isPaid')} className="rounded" />
            <span>Paid Event</span>
          </label>
        </div>

        {true && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input type="number" step="0.01" {...register('price')} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select {...register('currency')} className="input-field">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input {...register('venue')} className="input-field" placeholder="Venue name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input type="number" {...register('capacity')} className="input-field" placeholder="Max attendees" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input {...register('city')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input {...register('country')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
            <input {...register('meetingLink')} className="input-field" placeholder="Zoom/Meet URL" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50">
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
