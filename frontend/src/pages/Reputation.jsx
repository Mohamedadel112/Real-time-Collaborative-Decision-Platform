import AppLayout from '../components/AppLayout';
import { TrendingUp, Award, BarChart2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function Reputation() {
  const { user } = useAuthStore();
  const accuracy = user?.votesCount > 0 ? ((user.correctVotes / user.votesCount) * 100).toFixed(1) : 0;

  const expertCriteria = [
    { label: 'Reputation > 100', met: user?.reputation > 100, value: user?.reputation?.toFixed(1) ?? 0 },
    { label: 'Accuracy > 70%', met: accuracy > 70, value: `${accuracy}%` },
    { label: 'Votes > 50', met: user?.votesCount > 50, value: user?.votesCount ?? 0 },
  ];

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl space-y-8">
        <div>
          <p className="text-xs tracking-widest uppercase text-[#76777d] font-medium mb-2">Standing</p>
          <h1 className="font-display text-3xl font-bold text-[#0F172A]">Reputation</h1>
          <p className="text-[#45464d] mt-1.5 text-sm">Your trust score within the Jurist platform.</p>
        </div>

        {/* Score Banner */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-2xl p-8">
          <div className="grid grid-cols-3 gap-8">
            {[
              ['Reputation Score', user?.reputation?.toFixed(2) ?? '0.00', TrendingUp],
              ['Accuracy Rate', `${accuracy}%`, BarChart2],
              ['Total Votes', user?.votesCount ?? 0, Award],
            ].map(([label, value, Icon]) => (
              <div key={label} className="text-center">
                <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="font-display text-3xl font-bold text-white">{value}</p>
                <p className="text-white/40 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Role */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[#0F172A]">Current Role</h2>
          <div className="flex items-center gap-4">
            <span className="px-4 py-2 bg-emerald-950 text-emerald-400 rounded-full text-sm font-semibold font-display">
              {user?.role ?? 'GUEST'}
            </span>
            <p className="text-[#45464d] text-sm">Your current jurisdiction level determines your voting weight.</p>
          </div>
        </div>

        {/* Expert Promotion Criteria */}
        <div className="bg-white rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[#0F172A]">Expert Promotion Criteria</h2>
          <p className="text-[#45464d] text-sm">Meet all 3 conditions to be considered for Expert promotion.</p>
          <div className="space-y-3">
            {expertCriteria.map(({ label, met, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#f7f9fb]">
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${met ? 'bg-emerald-400 text-white' : 'bg-[#e0e3e5] text-[#76777d]'}`}>
                    {met ? '✓' : '·'}
                  </span>
                  <span className="text-sm text-[#0F172A]">{label}</span>
                </div>
                <span className={`text-sm font-display font-bold ${met ? 'text-emerald-600' : 'text-[#76777d]'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
