import { Shield, ShieldCheck, Star, Crown } from 'lucide-react';

const roleConfig = {
  GUEST: {
    label: 'Guest',
    icon: Shield,
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    ring: 'ring-slate-200',
  },
  USER: {
    label: 'User',
    icon: Shield,
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  TRUSTED_USER: {
    label: 'Trusted User',
    icon: ShieldCheck,
    bg: 'bg-emerald-950',
    text: 'text-emerald-400',
    ring: 'ring-emerald-800',
  },
  EXPERT: {
    label: 'Expert',
    icon: Star,
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    ring: 'ring-amber-200',
  },
  ADMIN: {
    label: 'Admin',
    icon: Crown,
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'ring-violet-200',
  },
};

/**
 * Displays the user's role as a styled badge.
 * @param {{ role: string, size?: 'sm' | 'md' | 'lg' }} props
 */
export default function RoleBadge({ role, size = 'md' }) {
  const config = roleConfig[role] || roleConfig.GUEST;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2',
  };
  const iconSizes = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' };

  return (
    <span
      className={`inline-flex items-center font-semibold font-display rounded-full ring-1 ${config.bg} ${config.text} ${config.ring} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
