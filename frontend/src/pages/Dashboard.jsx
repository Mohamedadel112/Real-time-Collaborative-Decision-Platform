import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRight, TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import useRoomStore from '../stores/roomStore';
import useDecisionStore from '../stores/decisionStore';
import useAuthStore from '../stores/authStore';

const statusBadge = (status) => {
  const map = {
    OPEN: 'bg-emerald-950 text-emerald-400',
    CLOSED: 'bg-slate-200 text-slate-600',
    VALIDATED: 'bg-blue-50 text-blue-700',
    INVALID: 'bg-red-50 text-red-600',
  };
  return map[status] || 'bg-slate-100 text-slate-500';
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { decisions, fetchDecisions } = useDecisionStore();

  useEffect(() => {
    fetchRooms();
  }, []);

  // Aggregate stats
  const activeRooms = rooms.filter((r) => true).slice(0, 4);
  const totalVotes = user?.votesCount ?? 0;

  const calculatePercentile = (rep) => {
    if (rep >= 100) return 'top 1%';
    if (rep >= 50) return 'top 5%';
    if (rep >= 20) return 'top 10%';
    if (rep >= 5) return 'top 25%';
    if (rep > 0) return 'top 50%';
    return 'bottom 50%';
  };
  const percentile = calculatePercentile(user?.reputation ?? 0);

  const stats = [
    { label: 'Reputation Score', value: user?.reputation?.toFixed(1) ?? '—', icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Total Votes Cast', value: totalVotes, icon: CheckCircle, color: 'text-blue-500' },
    { label: 'Active Rooms', value: rooms.length, icon: Users, color: 'text-violet-500' },
    { label: 'Correct Votes', value: user?.correctVotes ?? '—', icon: Clock, color: 'text-amber-500' },
  ];

  return (
    <AppLayout>
      <div className="p-8 space-y-10 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#76777d] font-medium mb-2">Jurist Dashboard</p>
            <h1 className="font-display text-3xl font-bold text-[#0F172A]">
              Welcome back{user?.username ? `, ${user.username}` : ''}.
            </h1>
            <p className="text-[#45464d] mt-1.5 text-sm">
              Your voting weight is currently in the {percentile} of all active participants.
            </p>
          </div>

          {/* Command actions */}
          <div className="flex gap-3">
            <Link
              to="/rooms"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#eceef0] hover:bg-[#e0e3e5] text-[#0F172A] rounded-xl text-sm font-medium transition"
            >
              <Users className="w-4 h-4" />
              Browse Rooms
            </Link>
            <Link
              to="/rooms?create=1"
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white rounded-xl text-sm font-semibold transition hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              New Chamber
            </Link>
          </div>
        </div>

        {/* Standing Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-2xl px-8 py-6">
          <div className="absolute right-0 top-0 w-72 h-72 bg-emerald-400/5 rounded-full translate-x-1/3 -translate-y-1/3" />
          <p className="text-white/40 text-xs font-medium uppercase tracking-widest mb-1">Current Standing</p>
          <h2 className="font-display text-xl font-bold text-white">
            Reputation: {user?.reputation?.toFixed(2) ?? '0.00'}
          </h2>
          <p className="text-white/50 text-sm mt-1.5 max-w-lg">
            Your voting weight is in the {percentile} of all active participants within the High Court chambers.
          </p>
          <div className="mt-4 flex gap-4">
            {[['Role', user?.role ?? 'GUEST'], ['Votes Cast', user?.votesCount ?? 0], ['Correct', user?.correctVotes ?? 0]].map(([k, v]) => (
              <div key={k} className="bg-white/10 rounded-lg px-4 py-2.5">
                <p className="text-white/40 text-[10px] uppercase tracking-wide">{k}</p>
                <p className="font-display font-bold text-white text-sm mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-display text-2xl font-bold text-[#0F172A]">{value}</p>
              <p className="text-[#76777d] text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Active Rooms */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-[#0F172A]">Active Rooms</h2>
            <Link to="/rooms" className="flex items-center gap-1 text-sm text-[#0F172A] font-medium hover:underline">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {activeRooms.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-[#76777d] text-sm">
              No active rooms. <Link to="/rooms?create=1" className="text-[#0F172A] font-semibold hover:underline">Create one →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeRooms.map((room) => (
                <Link
                  key={room.id}
                  to={`/rooms/${room.id}`}
                  className="group bg-white hover:bg-[#f7f9fb] rounded-2xl p-5 shadow-sm transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display font-semibold text-[#0F172A] text-sm group-hover:underline">
                        {room.name}
                      </p>
                      {room.topic && (
                        <p className="text-[#76777d] text-xs mt-1">{room.topic}</p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-950 text-emerald-400">
                      {room.isPrivate ? 'Private' : 'Open'}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-4 text-xs text-[#76777d]">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {room._count?.members ?? 0} members</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {room._count?.decisions ?? 0} decisions</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent verdicts placeholder */}
        <section>
          <h2 className="font-display text-lg font-bold text-[#0F172A] mb-5">Recent Verdicts</h2>
          <div className="bg-white rounded-2xl divide-y divide-[#f2f4f6]">
            {decisions.slice(0, 5).length === 0 ? (
              <div className="p-10 text-center text-[#76777d] text-sm">No verdicts yet.</div>
            ) : (
              decisions.slice(0, 5).map((d) => (
                <Link key={d.id} to={`/decisions/${d.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-[#f7f9fb] transition">
                  <div>
                    <p className="font-medium text-sm text-[#0F172A]">{d.title}</p>
                    <p className="text-xs text-[#76777d] mt-0.5">{d.domain ?? 'General'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${statusBadge(d.status)}`}>
                    {d.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
