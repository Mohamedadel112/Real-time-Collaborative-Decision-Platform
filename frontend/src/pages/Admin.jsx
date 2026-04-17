import { useEffect, useState } from 'react';
import { Plus, Mail, Users, Clock, AlertCircle, ShieldX } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import InviteModal from '../components/InviteModal';
import StatusBadge from '../components/StatusBadge';
import RoleBadge from '../components/RoleBadge';
import useInviteStore from '../stores/inviteStore';
import useAuthStore from '../stores/authStore';

export default function Admin() {
  const { user } = useAuthStore();
  const { invites, fetchInvites, isLoading, error } = useInviteStore();
  const [showInvite, setShowInvite] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (isAdmin) fetchInvites();
  }, [isAdmin]);

  const pendingCount = invites.filter((i) => i.status === 'PENDING').length;
  const acceptedCount = invites.filter((i) => i.status === 'ACCEPTED').length;
  const expiredCount = invites.filter((i) => i.status === 'EXPIRED').length;
  const remainingQuota = Math.max(0, 5 - pendingCount);

  const stats = [
    { label: 'Total Invites', value: invites.length, icon: Mail, color: 'text-blue-500' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-500' },
    { label: 'Accepted', value: acceptedCount, icon: Users, color: 'text-emerald-500' },
    { label: 'Remaining Quota', value: remainingQuota, icon: Plus, color: 'text-violet-500' },
  ];

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      {/* Access Denied for non-admins */}
      {!isAdmin ? (
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
              <ShieldX className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#0F172A]">Access Restricted</h2>
            <p className="text-[#45464d] text-sm">
              Only administrators can manage invitations. Your current role is:
            </p>
            <div className="flex justify-center">
              <RoleBadge role={user?.role} size="lg" />
            </div>
            <p className="text-xs text-[#76777d]">
              Contact an administrator to request elevated privileges.
            </p>
          </div>
        </div>
      ) : (
      <>
      {showInvite && <InviteModal onClose={() => { setShowInvite(false); fetchInvites(); }} />}

      <div className="p-8 space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#76777d] font-medium mb-2">
              Administration
            </p>
            <h1 className="font-display text-3xl font-bold text-[#0F172A]">Admin Dashboard</h1>
            <p className="text-[#45464d] mt-1.5 text-sm">
              Manage invitations and monitor platform access.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RoleBadge role={user?.role} size="md" />
            <button
              id="open-invite-modal"
              onClick={() => setShowInvite(true)}
              disabled={remainingQuota <= 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Invite User
            </button>
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Remaining Quota Banner */}
        {remainingQuota <= 2 && (
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm ${
            remainingQuota === 0
              ? 'bg-red-50 border border-red-100 text-red-700'
              : 'bg-amber-50 border border-amber-100 text-amber-700'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            {remainingQuota === 0
              ? 'Invite quota reached. Wait for pending invites to be accepted or expire.'
              : `Only ${remainingQuota} invite${remainingQuota > 1 ? 's' : ''} remaining.`}
          </div>
        )}

        {/* Invite History Table */}
        <section>
          <h2 className="font-display text-lg font-bold text-[#0F172A] mb-4">Invite History</h2>

          {isLoading ? (
            <div className="bg-white rounded-2xl p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#f2f4f6] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          ) : invites.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Mail className="w-10 h-10 text-[#c6c6cd] mx-auto mb-3" />
              <p className="font-display text-[#0F172A] font-semibold mb-1">No Invitations Sent</p>
              <p className="text-[#76777d] text-sm mb-5">
                Send your first invite to grow the Jurist community.
              </p>
              <button
                onClick={() => setShowInvite(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                <Plus className="w-4 h-4" />
                Send First Invite
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f2f4f6]">
                      <th className="text-left px-6 py-3 text-[10px] font-medium text-[#76777d] uppercase tracking-widest">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-medium text-[#76777d] uppercase tracking-widest">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-medium text-[#76777d] uppercase tracking-widest">
                        Sent
                      </th>
                      <th className="text-left px-6 py-3 text-[10px] font-medium text-[#76777d] uppercase tracking-widest">
                        Expires
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2f4f6]">
                    {invites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-[#f7f9fb] transition">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0F172A]">{invite.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={invite.status}
                            pulse={invite.status === 'PENDING'}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-[#76777d]">{formatDate(invite.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-[#76777d]">
                            {invite.acceptedAt
                              ? `Accepted ${formatDate(invite.acceptedAt)}`
                              : formatDate(invite.expiresAt)}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
      </>
      )}
    </AppLayout>
  );
}
