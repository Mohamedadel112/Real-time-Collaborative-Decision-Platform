const statusConfig = {
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    dot: 'bg-amber-400',
  },
  ACCEPTED: {
    label: 'Accepted',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    dot: 'bg-emerald-400',
  },
  EXPIRED: {
    label: 'Expired',
    bg: 'bg-red-50',
    text: 'text-red-500',
    dot: 'bg-red-400',
  },
  // Decision statuses
  OPEN: {
    label: 'Open',
    bg: 'bg-emerald-950',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  },
  VALIDATED: {
    label: 'Validated',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    dot: 'bg-blue-500',
  },
  INVALID: {
    label: 'Invalid',
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-500',
  },
};

/**
 * Universal status badge with pulsing dot for active statuses.
 * @param {{ status: string, pulse?: boolean }} props
 */
export default function StatusBadge({ status, pulse = false }) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${config.bg} ${config.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse ? 'animate-pulse' : ''}`}
      />
      {config.label}
    </span>
  );
}
