import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { eventService, uploadService } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

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

function toDatetimeLocal(date: string): string {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreateEvent() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [blurSensitiveData, setBlurSensitiveData] = useState(false);

  const { data: eventData } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(Number(id)),
    enabled: isEdit,
  });

  const event = eventData?.data?.data;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      eventType: 'conference',
      isPaid: false,
      isOnline: false,
      currency: 'AUD',
      status: 'published',
    }
  });

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        isPaid: event.isPaid,
        isOnline: event.isOnline,
        currency: event.currency,
        status: event.status,
        startDate: toDatetimeLocal(event.startDate),
        endDate: event.endDate ? toDatetimeLocal(event.endDate) : '',
        price: event.price,
        venue: event.venue || '',
        capacity: event.capacity?.toString() || '',
        city: event.city || '',
        country: event.country || '',
        meetingLink: event.meetingLink || '',
      });
      setExistingImages(event.images || []);
    }
  }, [event, reset]);

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    setUploadingImages(true);
    try {
      const responses = await Promise.all(
        files.map((file) => uploadService.uploadImage(file, blurSensitiveData))
      );
      return responses.map((r) => r.data.data.url);
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const urls = await uploadImages(selectedImages);
      const images = [...existingImages.filter((u) => !removedImages.includes(u)), ...urls];
      const eventPayload = {
        ...data,
        price: data.isPaid ? Number(data.price) : 0,
        capacity: data.capacity ? Number(data.capacity) : null,
        images,
      };

      if (isEdit) {
        await eventService.updateEvent(Number(id), eventPayload);
        toast.success('Event updated!');
      } else {
        const response = await eventService.createEvent(eventPayload);
        toast.success('Event created!');
        navigate(`/events/${response.data.data.id}`);
        return;
      }
      navigate(`/events/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{isEdit ? 'Edit Event' : 'Create Event'}</h1>

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
                <option value="USD">USD ($)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Images</label>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={blurSensitiveData}
              onChange={(e) => setBlurSensitiveData(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-500">Blur faces</span>
          </label>
          <label className="flex items-center justify-center gap-3 border border-dashed border-gray-300 rounded-xl p-6 bg-white cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">{uploadingImages ? 'Uploading...' : 'Click to upload images'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploadingImages}
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setSelectedImages((prev) => [...prev, ...files]);
                e.currentTarget.value = '';
              }}
            />
          </label>
          {(existingImages.length > 0 || selectedImages.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {existingImages
                .filter((u) => !removedImages.includes(u))
                .map((url, i) => (
                  <div key={`existing-${i}`} className="relative group">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden border">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setRemovedImages((prev) => [...prev, url])}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              {selectedImages.map((file, i) => (
                <div key={i} className="relative group">
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500 overflow-hidden border">
                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading || uploadingImages} className="w-full btn-primary py-3 disabled:opacity-50">
          {loading ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
