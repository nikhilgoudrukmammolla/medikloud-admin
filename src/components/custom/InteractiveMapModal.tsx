import React from 'react';

type InteractiveMapModalProps = {
  open: boolean;
  addressString: string;
  onClose: () => void;
};

const InteractiveMapModal: React.FC<InteractiveMapModalProps> = ({ open, addressString, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-0 overflow-hidden relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Interactive Map</h2>
          <iframe
            title="Google Map"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '12px', width: '100%' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(addressString)}&output=embed`}
          />
        </div>
      </div>
    </div>
  );
};

export default InteractiveMapModal; 