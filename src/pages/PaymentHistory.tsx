import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/api';
import { FaCreditCard, FaDownload } from 'react-icons/fa';

export default function PaymentHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentService.getHistory(),
  });

  const payments = data?.data?.data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment: any) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{payment.event?.title}</p>
                  <p className="text-sm text-gray-500">{new Date(payment.event?.startDate).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">${payment.amount}</p>
                  <p className="text-sm text-gray-500">{payment.currency}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-2">
                    <FaCreditCard className="text-gray-400" />
                    {payment.paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    payment.status === 'refunded' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button className="text-gray-400 hover:text-primary-600" title="Download invoice">
                    <FaDownload />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {payments.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-500">
          No payment history yet
        </div>
      )}
    </div>
  );
}
