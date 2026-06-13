import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService, paymentService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaTicketAlt, FaCheck } from 'react-icons/fa';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ eventId, onSuccess }: { eventId: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { data } = await paymentService.createPaymentIntent(eventId);
      
      const result = await stripe.confirmCardPayment(data.data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) {
        toast.error(result.error.message || 'Payment failed');
      } else if (result.paymentIntent.status === 'succeeded') {
        await paymentService.confirmPayment(data.data.paymentId);
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="border rounded-lg p-4 mb-4">
        <CardElement />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay with Stripe'}
      </button>
    </form>
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const { user, token } = useAuthStore();
  const queryClient = useQueryClient();
  const [showPayment, setShowPayment] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventService.getEvent(Number(id)),
  });

  const registerMutation = useMutation({
    mutationFn: () => eventService.registerEvent(Number(id)),
    onSuccess: () => {
      toast.success('Registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['event', id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });

  const event = data?.data?.data;
  const isRegistered = event?.attendees?.some((a: any) => a.id === user?.id);

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (!event) return <div className="text-center py-12">Event not found</div>;

  const isOrganizer = user?.id === event.organizerId;

  return (
    <div>
      <Link to="/events" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Events
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="card p-6">
            <span className="text-sm font-medium text-primary-600 uppercase">
              {event.eventType}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">{event.title}</h1>

            <div className="mt-6 space-y-4 text-gray-600">
              <p className="flex items-center gap-3">
                <FaCalendarAlt className="text-primary-600" />
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </p>
              {event.city && (
                <p className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-primary-600" />
                  {event.venue && `${event.venue}, `}{event.city}, {event.country}
                </p>
              )}
              {event.isOnline && (
                <p className="flex items-center gap-3">
                  <span className="text-primary-600">🌐</span> Online Event
                </p>
              )}
              <p className="flex items-center gap-3">
                <FaUsers className="text-primary-600" />
                {event.capacity ? `${event.attendees?.length || 0}/${event.capacity} registered` : 'No capacity limit'}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">About this event</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
            </div>

            {event.organizer && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Organizer</h2>
                <Link to={`/profile/${event.organizer.id}`} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {event.organizer.firstName?.[0]}{event.organizer.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer.firstName} {event.organizer.lastName}</p>
                    <p className="text-sm text-gray-500">{event.organizer.title}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card p-6 sticky top-4">
            <div className="flex items-center gap-3 mb-4">
              <FaTicketAlt className="w-6 h-6 text-primary-600" />
              <span className="text-2xl font-bold">
                {event.isPaid ? `$${event.price}` : 'Free'}
              </span>
            </div>

            {token ? (
              isRegistered ? (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                    <FaCheck className="w-5 h-5" />
                    <span className="font-semibold">You're registered!</span>
                  </div>
                  {event.isOnline && event.meetingLink && (
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary block text-center"
                    >
                      Join Event
                    </a>
                  )}
                </div>
              ) : isOrganizer ? (
                <p className="text-gray-500 text-center">You are the organizer</p>
              ) : event.isPaid ? (
                <>
                  <button
                    onClick={() => setShowPayment(!showPayment)}
                    className="w-full btn-primary"
                  >
                    Register & Pay
                  </button>
                  {showPayment && (
                    <Elements stripe={stripePromise}>
                      <PaymentForm eventId={event.id} onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['event', id] });
                      }} />
                    </Elements>
                  )}
                </>
              ) : (
                <button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {registerMutation.isPending ? 'Registering...' : 'Register for Free'}
                </button>
              )
            ) : (
              <Link to="/login" className="btn-primary block text-center">
                Login to Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
