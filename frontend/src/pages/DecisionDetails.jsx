import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle, AlertCircle, Clock, Zap, MessageSquare } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import useDecisionStore from '../stores/decisionStore';
import useAuthStore from '../stores/authStore';
import { connectSocket, disconnectSocket } from '../api/socket';

const confidenceColor = (c) => {
  if (c >= 0.7) return 'text-emerald-500';
  if (c >= 0.5) return 'text-amber-500';
  return 'text-red-500';
};

const confidenceLabel = (c) => {
  if (c >= 0.7) return 'Strong Consensus';
  if (c >= 0.5) return 'Weak Consensus';
  return 'No Consensus';
};

const statusConfig = {
  OPEN: { label: 'Live Consensus', color: 'bg-emerald-950 text-emerald-400', dot: 'bg-emerald-400' },
  CLOSED: { label: 'Closed', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  VALIDATED: { label: 'Validated', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  INVALID: { label: 'Invalid', color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

export default function DecisionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDecision, fetchDecision, castVote, updateDecisionLive, isLoading } = useDecisionStore();
  const { user } = useAuthStore();

  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState(null);
  const [voteSuccess, setVoteSuccess] = useState(false);

  useEffect(() => {
    fetchDecision(id);

    // WebSocket: join decision room & listen for live updates
    const socket = connectSocket();
    socket.emit('joinDecision', { decisionId: id });

    socket.on('decisionUpdated', (updated) => {
      if (updated.id === id) updateDecisionLive(updated);
    });

    socket.on('voteRegistered', (data) => {
      if (data.decisionId === id) fetchDecision(id);
    });

    return () => {
      socket.off('decisionUpdated');
      socket.off('voteRegistered');
      socket.emit('leaveDecision', { decisionId: id });
    };
  }, [id]);

  // Check if current user already voted
  useEffect(() => {
    if (currentDecision && user) {
      const voted = currentDecision.votes?.some((v) => v.userId === user.id);
      setHasVoted(voted);
      if (voted) {
        const myVote = currentDecision.votes?.find((v) => v.userId === user.id);
        setSelectedOption(myVote?.optionId);
      }
    }
  }, [currentDecision, user]);

  const handleVote = async () => {
    if (!selectedOption || hasVoted || currentDecision?.status !== 'OPEN') return;
    setIsVoting(true);
    setVoteError(null);
    try {
      await castVote(currentDecision.id, selectedOption);
      setHasVoted(true);
      setVoteSuccess(true);
      await fetchDecision(id);
    } catch (err) {
      setVoteError(err.response?.data?.message || 'Vote failed. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (isLoading && !currentDecision) {
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center min-h-96">
          <div className="animate-pulse text-[#76777d] text-sm">Loading decision...</div>
        </div>
      </AppLayout>
    );
  }

  if (!currentDecision) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <p className="text-[#76777d]">Decision not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-[#0F172A] hover:underline">← Go Back</button>
        </div>
      </AppLayout>
    );
  }

  const d = currentDecision;
  const cfg = statusConfig[d.status] ?? statusConfig.OPEN;
  const totalWeight = d.options?.reduce((sum, o) => sum + o.totalWeight, 0) || 1;
  const totalVotes = d.options?.reduce((sum, o) => sum + o.votesCount, 0) || 0;
  const isOpen = d.status === 'OPEN';

  return (
    <AppLayout>
      <div className="p-8 max-w-5xl space-y-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#76777d] hover:text-[#0F172A] transition">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero Header */}
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1e293b] rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-400/5 rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isOpen ? 'animate-pulse' : ''}`} />
                {cfg.label}
              </span>
              {d.domain && (
                <span className="px-2.5 py-1 bg-white/10 text-white/60 rounded-full text-[10px]">{d.domain}</span>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold text-white pr-8">{d.title}</h1>
            {d.description && (
              <p className="text-white/50 text-sm leading-relaxed max-w-2xl">{d.description}</p>
            )}

            <div className="flex gap-6 pt-2">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest">Total Votes</p>
                <p className="font-display text-xl font-bold text-white">{totalVotes}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest">Confidence</p>
                <p className={`font-display text-xl font-bold ${confidenceColor(d.confidence)}`}>
                  {(d.confidence * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest">Quorum</p>
                <p className="font-display text-xl font-bold text-white">{d.confidence >= 0.5 ? '✓ Reached' : 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voting panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Consensus Dynamics */}
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <h2 className="font-display text-base font-bold text-[#0F172A]">Consensus Dynamics</h2>

              {d.options?.map((option) => {
                const pct = totalWeight > 0 ? (option.totalWeight / totalWeight) * 100 : 0;
                const isWinning = d.winningOption === option.id;
                const isMyChoice = selectedOption === option.id;

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${isWinning ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
                        {option.label}
                        {isWinning && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Leading</span>}
                      </span>
                      <span className="text-[#76777d] text-xs">{option.votesCount} votes • {pct.toFixed(1)}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isWinning ? 'bg-emerald-400' : 'bg-[#0F172A]/30'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vote */}
            <div className="bg-white rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#0F172A]">Cast Your Decision</h2>
                <span className="text-xs text-[#76777d]">{hasVoted ? '✓ Vote recorded' : isOpen ? 'Your vote is final' : 'Voting closed'}</span>
              </div>

              {voteError && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {voteError}
                </div>
              )}
              {voteSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" /> Your verdict has been immutably recorded on the Jurist Ledger.
                </div>
              )}

              <p className="text-xs text-[#45464d]">
                Your vote is final and will be immutably recorded on the Jurist Ledger once confirmed.
              </p>

              <div className="space-y-3">
                {d.options?.map((option) => {
                  const isSelected = selectedOption === option.id;
                  return (
                    <button
                      key={option.id}
                      id={`option-${option.id}`}
                      disabled={hasVoted || !isOpen}
                      onClick={() => !hasVoted && isOpen && setSelectedOption(option.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-950/5 text-[#0F172A]'
                          : 'border-[#e0e3e5] bg-[#f7f9fb] text-[#45464d] hover:border-[#0F172A]/30 hover:bg-white'
                      } ${(hasVoted || !isOpen) ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-[#c6c6cd]'
                        }`}>
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                        <span>{option.label}</span>
                      </div>
                      {option.description && (
                        <p className="text-xs text-[#76777d] mt-1.5 pl-7">{option.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>

              {!hasVoted && isOpen && (
                <button
                  id="cast-vote-btn"
                  onClick={handleVote}
                  disabled={!selectedOption || isVoting}
                  className="w-full py-3.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white font-display font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  {isVoting ? 'Recording Vote...' : 'Confirm Verdict'}
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar: deliberation */}
          <div className="space-y-5">
            {/* Your power */}
            <div className="bg-[#0F172A] rounded-2xl p-5">
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Your Voting Power</p>
              <p className="font-display text-2xl font-bold text-white">—</p>
              <p className="text-white/40 text-xs mt-1">Based on reputation & role</p>
            </div>

            {/* Confidence Meter */}
            <div className="bg-white rounded-2xl p-5 space-y-3">
              <h3 className="font-display text-sm font-bold text-[#0F172A]">Consensus Meter</h3>
              <div className="flex items-end gap-2">
                <span className={`font-display text-3xl font-bold ${confidenceColor(d.confidence)}`}>
                  {(d.confidence * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-[#76777d] pb-1">{confidenceLabel(d.confidence)}</span>
              </div>
              <div className="h-2 bg-[#f2f4f6] rounded-full">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                  style={{ width: `${(d.confidence * 100).toFixed(0)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[#76777d]">
                <span>Invalid &lt;50%</span>
                <span>&gt;70% Valid</span>
              </div>
            </div>

            {/* Deliberation log */}
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <h3 className="font-display text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Jurist Deliberation
              </h3>
              {d.reviews?.length === 0 || !d.reviews ? (
                <p className="text-xs text-[#76777d]">No deliberations yet. Be the first to review.</p>
              ) : (
                d.reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#0F172A]">Jurist.{r.userId?.slice(0, 6)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {r.isCorrect ? 'Supports' : 'Disputes'}
                      </span>
                    </div>
                    {r.comment && <p className="text-xs text-[#76777d] leading-relaxed">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
