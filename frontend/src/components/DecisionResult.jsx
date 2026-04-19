import { CheckCircle, XCircle, TrendingUp, BarChart2, Award } from 'lucide-react';

/**
 * Shows the final decision result explanation after voting is closed.
 *
 * @param {{ decision: object }} props
 *   decision.status — CLOSED | VALIDATED | INVALID
 *   decision.winningOption — id of the winning option
 *   decision.options — array of { id, label, totalWeight, votesCount }
 *   decision.confidence — 0..1
 */
export default function DecisionResult({ decision }) {
  if (!decision || decision.status === 'OPEN') return null;

  const d = decision;
  const winner = d.options?.find((o) => o.id === d.winningOption);
  const totalVotes = d.options?.reduce((sum, o) => sum + o.votesCount, 0) || 0;
  const totalWeight = d.options?.reduce((sum, o) => sum + o.totalWeight, 0) || 1;
  const confidencePct = (d.confidence * 100).toFixed(0);
  const isValidated = d.status === 'VALIDATED';
  const isInvalid = d.status === 'INVALID';

  const outcomeLabel = () => {
    if (isValidated) return 'High confidence outcome';
    if (isInvalid) return 'Insufficient consensus';
    if (d.confidence >= 0.7) return 'Strong consensus reached';
    if (d.confidence >= 0.5) return 'Moderate consensus';
    return 'Weak consensus';
  };

  const explanations = [];

  if (winner) {
    explanations.push({
      icon: CheckCircle,
      text: `Won by weighted voting`,
      color: 'text-emerald-500',
      detail: `${winner.label} received ${winner.totalWeight.toFixed(1)} weighted votes`,
    });
  }

  explanations.push({
    icon: BarChart2,
    text: `Confidence: ${confidencePct}%`,
    color: d.confidence >= 0.7 ? 'text-emerald-500' : d.confidence >= 0.5 ? 'text-amber-500' : 'text-red-500',
    detail: d.confidence >= 0.7 ? 'Strong consensus threshold passed' : d.confidence >= 0.5 ? 'Minimum consensus threshold met' : 'Below consensus threshold',
  });

  explanations.push({
    icon: isValidated ? Award : TrendingUp,
    text: `Outcome: ${outcomeLabel()}`,
    color: isValidated ? 'text-emerald-500' : isInvalid ? 'text-red-500' : 'text-amber-500',
    detail: `${totalVotes} total votes from ${d.options?.length || 0} options`,
  });

  return (
    <div className="bg-white rounded-2xl p-6 space-y-5 border border-[#f2f4f6]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#76777d] font-medium mb-1">
            Decision Result
          </p>
          <h3 className="font-display text-lg font-bold text-[#0F172A]">
            {winner ? winner.label : 'No Winner'}
            {isValidated && (
              <span className="ml-2 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                Selected
              </span>
            )}
            {isInvalid && (
              <span className="ml-2 text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                Invalid
              </span>
            )}
          </h3>
        </div>

        {/* Confidence ring */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-[#f2f4f6] flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke={d.confidence >= 0.7 ? '#10B981' : d.confidence >= 0.5 ? '#F59E0B' : '#EF4444'}
                strokeWidth="4"
                strokeDasharray={`${d.confidence * 150.8} 150.8`}
                strokeLinecap="round"
              />
            </svg>
            <span className="font-display text-sm font-bold text-[#0F172A] relative z-10">
              {confidencePct}%
            </span>
          </div>
        </div>
      </div>

      {/* Explanation items */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-[#45464d] uppercase tracking-wide">Explanation</p>
        {explanations.map(({ icon: Icon, text, color, detail }) => (
          <div key={text} className="flex items-start gap-3 px-4 py-3 bg-[#f7f9fb] rounded-xl">
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${color}`} />
            <div>
              <p className={`text-sm font-medium ${color}`}>{text}</p>
              <p className="text-xs text-[#76777d] mt-0.5">{detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Option breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#45464d] uppercase tracking-wide">Final Breakdown</p>
        {d.options?.map((option) => {
          const pct = totalWeight > 0 ? (option.totalWeight / totalWeight) * 100 : 0;
          const isWinner = option.id === d.winningOption;

          return (
            <div key={option.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${isWinner ? 'text-emerald-600' : 'text-[#45464d]'}`}>
                  {isWinner && (
                    <CheckCircle className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  )}
                  {option.label}
                </span>
                <span className="text-xs text-[#76777d]">
                  {option.votesCount} votes · {pct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-[#f2f4f6] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isWinner ? 'bg-emerald-400' : 'bg-[#0F172A]/20'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
