import React from 'react';
import { FileText } from 'lucide-react';

interface Order {
  id: string;
  orderId: string;
  uid: string;
  patientName: string;
  phone: string;
  altPhone?: string | null;
  address?: any;
  files: string[];
  status: 'Received' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: any;
  notes?: string;
  flat?: string;
  street?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  type?: string;
}

type OrderDetailsModalProps = {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onShowMap: () => void;
  zoomImage: string | null;
  setZoomImage: (url: string | null) => void;
};

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ open, order, onClose, onShowMap, zoomImage, setZoomImage }) => {
  if (!open || !order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-0 overflow-hidden relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* Image Gallery */}
        <div className="w-full bg-gray-50 flex flex-col items-center justify-center p-6 border-b">
          {order.files && order.files.length > 0 ? (
            <div className={`grid gap-4 ${order.files.length > 1 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} w-full`}>
              {order.files.map((url, idx) => (
                <div key={idx} className="relative group cursor-pointer rounded-lg overflow-hidden border shadow bg-white flex items-center justify-center" style={{ minHeight: 120 }}>
                  <img
                    src={url}
                    alt={`Order file ${idx + 1}`}
                    className="object-contain max-h-60 w-full transition-transform duration-200 group-hover:scale-105"
                    style={{ background: '#f3f4f6', maxWidth: '100%' }}
                    onClick={() => setZoomImage(url)}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Click to enlarge</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 w-full text-gray-400">
              <FileText className="w-12 h-12 mb-2" />
              <span>No images uploaded</span>
            </div>
          )}
        </div>
        {/* Order Details */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50">
          <div className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Details</h2>
            <div className="space-y-2 text-base text-gray-700">
              <div><span className="font-medium text-blue-700">Order ID:</span> {order.orderId}</div>
              <div><span className="font-medium text-blue-700">Patient Name:</span> {order.patientName}</div>
              <div><span className="font-medium text-blue-700">Phone:</span> {order.phone}</div>
              {('altPhone' in order) && order.altPhone && <div><span className="font-medium text-blue-700">Alt Phone:</span> {order.altPhone}</div>}
              <div><span className="font-medium text-blue-700">Status:</span> {order.status}</div>
              <div><span className="font-medium text-blue-700">Created At:</span> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A'}</div>
              {('notes' in order) && order.notes && <div><span className="font-medium text-blue-700">Notes:</span> {order.notes}</div>}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Address</h2>
            {/* Show full address from DB if present */}
            {order.address && (
              <div className="mb-3 p-3 rounded bg-blue-50 border border-blue-200 text-blue-900 text-sm">
                <span className="font-semibold">Entered Address:</span><br />
                {typeof order.address === 'string'
                  ? order.address
                  : Object.values(order.address).filter(Boolean).join(', ')}
              </div>
            )}
            <button
              className="mb-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 transition font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              onClick={onShowMap}
              title={order.city || order.state || order.pincode || order.street ? '' : 'Map may not show correctly if address is missing'}
            >
              Show Map
            </button>
            {(order.city || order.state || order.pincode || order.street) && (
              <div className="mt-4 rounded-lg overflow-hidden border shadow">
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
                    `${order.flat || ''} ${order.street || ''} ${order.city || ''} ${order.state || ''} ${order.pincode || ''}`
                  )}&zoom=15&size=400x200&markers=color:red%7C${encodeURIComponent(
                    `${order.flat || ''} ${order.street || ''} ${order.city || ''} ${order.state || ''} ${order.pincode || ''}`
                  )}&key=YOUR_GOOGLE_MAPS_API_KEY`}
                  alt="Order Address Map"
                  className="w-full h-40 object-cover"
                  style={{ minWidth: 200, minHeight: 100 }}
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
        </div>
        {/* Image Zoom Modal */}
        {zoomImage && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70" onClick={() => setZoomImage(null)}>
            <img
              src={zoomImage}
              alt="Zoomed order file"
              className="max-w-3xl max-h-[90vh] rounded-lg shadow-2xl border-4 border-white object-contain bg-white"
              style={{ cursor: 'zoom-out' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsModal; 