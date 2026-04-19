import { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Send } from 'lucide-react';
import useInviteStore from '../stores/inviteStore';

/**
 * Admin modal for sending invite to a new user via email.
 * @param {{ onClose: () => void }} props
 */
export default function InviteModal({ onClose }) {
  const [email, setEmail] = useState('');
  const { sendInvite, sendingInvite, error, sendSuccess, clearError, clearSendSuccess } =
    useInviteStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    clearSendSuccess();
    try {
      await sendInvite(email);
      setEmail('');
    } catch (_) {
      // Error handled in store
    }
  };

  const handleClose = () => {
    clearError();
    clearSendSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#0F172A]">Invite User</h3>
              <p className="text-xs text-[#76777d]">Send an invite link via email</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-[#76777d] hover:text-[#0F172A] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {sendSuccess && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-700">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <div>
              <p className="font-medium">Invitation sent successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                The invite link will expire in 72 hours.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#45464d] uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              placeholder="colleague@company.com"
              className="w-full px-4 py-3 bg-[#f2f4f6] rounded-xl text-sm text-[#0F172A] placeholder-[#76777d] outline-none focus:ring-2 focus:ring-[#0F172A] transition"
            />
          </div>

          <div className="bg-[#f7f9fb] rounded-xl px-4 py-3">
            <p className="text-xs text-[#45464d]">
              The invited user will receive a link to register. Upon completion, they will
              automatically receive <span className="font-semibold text-[#0F172A]">Trusted User</span> status
              with enhanced voting weight.
            </p>
          </div>

          <button
            id="send-invite-btn"
            type="submit"
            disabled={sendingInvite || !email}
            className="w-full py-3 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sendingInvite ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </div>
  );
}
