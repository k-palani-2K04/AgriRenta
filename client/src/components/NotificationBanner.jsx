import React from 'react';
import { Bell, CheckCircle, Truck, Wallet, RotateCcw, X, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const iconFor = (type) => {
  switch (type) {
    case 'payment_confirmed':
      return <ShieldCheck className="w-5 h-5" />;
    case 'provider_accepted':
    case 'job_completed':
      return <CheckCircle className="w-5 h-5" />;
    case 'en_route':
    case 'arrived':
      return <Truck className="w-5 h-5" />;
    case 'payout_disbursed':
      return <Wallet className="w-5 h-5" />;
    case 'refunded':
      return <RotateCcw className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

export const NotificationBanner = () => {
  const { banner, dismissBanner, enablePush, pushEnabled } = useNotifications();

  if (!banner) return null;

  const isPayment = banner.type === 'payment_confirmed';
  const tone = isPayment
    ? 'from-emerald-600 to-teal-700'
    : banner.type === 'refunded'
      ? 'from-rose-600 to-rose-700'
      : 'from-indigo-700 to-sky-700';

  return (
    <div className={`rounded-2xl bg-gradient-to-r ${tone} text-white p-4 shadow-lg mb-4 flex items-start gap-3`}>
      <div className="bg-white/20 p-2 rounded-xl shrink-0">{iconFor(banner.type)}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-extrabold leading-tight">{banner.title}</p>
        <p className="text-xs text-white/90 mt-0.5">{banner.body}</p>
        {isPayment && (
          <p className="text-[10px] font-mono font-bold mt-1 bg-white/15 inline-block px-2 py-0.5 rounded-md">
            paymentStatus: '{banner.payload?.paymentStatus || 'confirmed'}'
          </p>
        )}
        {!pushEnabled && (
          <button
            type="button"
            onClick={enablePush}
            className="mt-2 min-h-12 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold active:scale-95 transition-transform"
          >
            Enable browser push alerts
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={dismissBanner}
        className="p-2 min-h-12 min-w-12 rounded-xl hover:bg-white/10 active:scale-95 transition-transform"
        aria-label="Dismiss notification"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
