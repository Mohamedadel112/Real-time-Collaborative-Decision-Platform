import { useEffect, useState } from 'react';
import { X, Zap, Shield, ShieldCheck, Flame, Target, TrendingUp, Award } from 'lucide-react';

const iconMap = {
  Base: Shield,
  'Trusted User': ShieldCheck,
  'Warm Start': Flame,
  'Skill Match': Target,
  Reputation: TrendingUp,
  Accuracy: Award,
};

const colorMap = {
  Base: 'text-blue-400 bg-blue-400/10',
  'Trusted User': 'text-emerald-400 bg-emerald-400/10',
  'Warm Start': 'text-orange-400 bg-orange-400/10',
  'Skill Match': 'text-violet-400 bg-violet-400/10',
  Reputation: 'text-cyan-400 bg-cyan-400/10',
  Accuracy: 'text-amber-400 bg-amber-400/10',
};

/**
 * Animated weight breakdown modal — shown after casting a vote.
 * @param {{ weightResult: { weight: number, explanation: string[] }, onClose: () => void }} props
 */
export default function WeightBreakdown({ weightResult, onClose }) {
  const [visibleItems, setVisibleItems] = useState(0);
  const [showTotal, setShowTotal] = useState(false);

  // Parse explanation strings like "+2 Trusted User" into { value, label }
  const items = (weightResult?.explanation || []).map((line) => {
    const match = line.match(/^\+?([\d.]+)\s+(.+)$/);
    return match
      ? { value: parseFloat(match[1]), label: match[2] }
      : { value: 0, label: line };
  });

  // Staggered animation: reveal each item one by one
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setVisibleItems((prev) => {
        if (prev >= items.length) {
          clearInterval(interval);
          setTimeout(() => setShowTotal(true), 300);
          return prev;
        }
        return prev + 1;
      });
    }, 250);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!weightResult) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0F172A] rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-6 border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">Vote Registered</h3>
              <p className="text-xs text-white/40">Weight breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2">
          {items.map((item, i) => {
            const Icon = iconMap[item.label] || Shield;
            const color = colorMap[item.label] || 'text-slate-400 bg-slate-400/10';
            const [textColor, bgColor] = color.split(' ');

            return (
              <div
                key={item.label}
                className={`flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 transition-all duration-500 ${
                  i < visibleItems
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-3'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${textColor}`} />
                  </div>
                  <span className="text-sm text-white/70 font-medium">{item.label}</span>
                </div>
                <span className={`font-display font-bold text-sm ${textColor}`}>
                  +{item.value}
                </span>
              </div>
            );
          })}
        </div>

        {/* Total Weight */}
        <div
          className={`border-t border-white/10 pt-4 transition-all duration-500 ${
            showTotal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-sm font-medium">Your Total Weight</span>
            <span className="font-display text-3xl font-bold text-emerald-400">
              {weightResult.weight}
            </span>
          </div>
          <p className="text-white/30 text-xs mt-2">
            Your vote counts as {weightResult.weight}× in the weighted consensus calculation.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-sm transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
