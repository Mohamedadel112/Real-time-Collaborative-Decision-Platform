import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, Users, X } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import useRoomStore from '../stores/roomStore';
import useDecisionStore from '../stores/decisionStore';

const statusConfig = {
  OPEN: { label: 'Open', color: 'bg-emerald-950 text-emerald-400' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-500' },
  VALIDATED: { label: 'Validated', color: 'bg-blue-50 text-blue-600' },
  INVALID: { label: 'Invalid', color: 'bg-red-50 text-red-600' },
};

function CreateDecisionModal({ roomId, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    domain: '',
    options: [{ label: '', description: '' }, { label: '', description: '' }],
  });
  const { isLoading, error } = useDecisionStore();

  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, { label: '', description: '' }] }));
  const removeOption = (i) => setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  const updateOption = (i, field, val) =>
    setForm((f) => ({ ...f, options: f.options.map((o, idx) => (idx === i ? { ...o, [field]: val } : o)) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        options: form.options.map((o) => o.label).filter((l) => l.trim() !== ''),
        roomId,
      };
      await onCreate(payload);
      onClose();
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-[#0F172A]">New Decision Proposal</h3>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#0F172A]"><X className="w-5 h-5" /></button>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 text-sm rounded-lg border border-red-100">
            {Array.isArray(error) ? error[0] : error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['title', 'Title', 'e.g. Treasury Re-allocation...'], ['description', 'Description', 'Describe the proposal...'], ['domain', 'Domain', 'e.g. Finance, Governance...']].map(([field, label, ph]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[#45464d] uppercase tracking-wide mb-1.5">{label}</label>
              {field === 'description' ? (
                <textarea
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={ph}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#f2f4f6] rounded-xl text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#0F172A] transition resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  placeholder={ph}
                  required={field === 'title'}
                  className="w-full px-4 py-2.5 bg-[#f2f4f6] rounded-xl text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#0F172A] transition"
                />
              )}
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#45464d] uppercase tracking-wide">Options (min 2)</label>
              <button type="button" onClick={addOption} className="text-xs text-[#0F172A] font-medium hover:underline">+ Add Option</button>
            </div>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => updateOption(i, 'label', e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    required
                    className="flex-1 px-3 py-2 bg-[#f2f4f6] rounded-lg text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#0F172A] transition"
                  />
                  {form.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-[#76777d] hover:text-red-500 transition">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
          >
            {isLoading ? 'Proposing...' : 'Submit Proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRoom, fetchRoom } = useRoomStore();
  const { decisions, fetchDecisions, createDecision, isLoading } = useDecisionStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchRoom(id);
    fetchDecisions(id);
  }, [id]);

  const r = currentRoom;

  return (
    <AppLayout>
      {showCreate && (
        <CreateDecisionModal
          roomId={id}
          onClose={() => setShowCreate(false)}
          onCreate={createDecision}
        />
      )}
      <div className="p-8 max-w-5xl space-y-8">
        <button onClick={() => navigate('/rooms')} className="flex items-center gap-2 text-sm text-[#76777d] hover:text-[#0F172A] transition">
          <ArrowLeft className="w-4 h-4" /> All Chambers
        </button>

        {r && (
          <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-2xl p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">{r.topic ?? 'General'}</p>
                <h1 className="font-display text-2xl font-bold text-white">{r.name}</h1>
                {r.description && <p className="text-white/50 text-sm mt-2 max-w-xl">{r.description}</p>}
              </div>
              <button
                id="new-decision-btn"
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition"
              >
                <Plus className="w-4 h-4" /> New Decision
              </button>
            </div>
            <div className="flex gap-6 mt-5">
              {[['Members', `${r.members?.length ?? 0}/${r.maxMembers}`, Users], ['Decisions', decisions.length, Clock]].map(([label, val, Icon]) => (
                <div key={label} className="bg-white/10 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <Icon className="w-4 h-4 text-white/50" />
                  <div>
                    <p className="text-white/40 text-[10px] uppercase">{label}</p>
                    <p className="font-display font-bold text-white text-sm">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decisions list */}
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#0F172A]">Active Proposals</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
            </div>
          ) : decisions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <p className="font-display text-[#0F172A] font-semibold mb-1">No Proposals Yet</p>
              <p className="text-[#76777d] text-sm mb-5">Create the first decision for this chamber.</p>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition">
                <Plus className="w-4 h-4" /> New Decision
              </button>
            </div>
          ) : (
            decisions.map((d) => {
              const cfg = statusConfig[d.status] ?? statusConfig.OPEN;
              const totalVotes = d.options?.reduce((s, o) => s + o.votesCount, 0) ?? 0;
              return (
                <Link
                  key={d.id}
                  to={`/decisions/${d.id}`}
                  className="flex items-center justify-between bg-white hover:bg-[#f7f9fb] rounded-2xl px-6 py-4 shadow-sm transition"
                >
                  <div>
                    <p className="font-display font-semibold text-[#0F172A] hover:underline">{d.title}</p>
                    <p className="text-xs text-[#76777d] mt-0.5">{d.domain ?? 'General'} • {totalVotes} votes • Confidence: {(d.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
