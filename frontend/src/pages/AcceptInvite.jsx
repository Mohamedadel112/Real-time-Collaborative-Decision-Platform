import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Scale, Eye, EyeOff, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { acceptInvite, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [success, setSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    if (!token) {
      setTokenError('No invite token provided. Please check your invite link.');
    }
  }, [token]);

  const handleChange = (e) => {
    clearError();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      await acceptInvite(token, {
        username: form.username,
        password: form.password,
      });
      setSuccess(true);
      // Auto redirect after 2 seconds
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (_) {
      // error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Left panel – brand */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#131b2e] to-emerald-950 opacity-90" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-400/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-white text-lg">Jurist AI</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-400/10 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold">Trusted Invitation</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            You've Been<br />Invited
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-md">
            A member of the Jurist platform has invited you to join as a Trusted User —
            with enhanced voting weight and access to high-stakes decision-making.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          {[['Trusted', 'User Status'], ['+2', 'Bonus Weight'], ['72h', 'Link Expiry']].map(([num, label]) => (
            <div key={label}>
              <p className="font-display text-2xl font-bold text-white">{num}</p>
              <p className="text-white/40 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel – form */}
      <div className="flex flex-1 lg:max-w-[560px] items-center justify-center p-8 bg-[#f7f9fb]">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F172A] rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-[#0F172A] text-lg">Jurist AI</span>
          </div>

          {/* Success State */}
          {success ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-[#0F172A]">Welcome, Jurist!</h2>
                <p className="text-[#45464d] mt-2 text-sm">
                  Your identity has been established. You are now a Trusted User with
                  enhanced voting privileges. Redirecting to your dashboard...
                </p>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">Trusted User</span>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div>
                <h2 className="font-display text-3xl font-bold text-[#0F172A]">
                  Accept Invitation
                </h2>
                <p className="text-[#45464d] mt-1.5 text-sm">
                  Complete your registration to join the platform.
                </p>
              </div>

              {/* Token Error */}
              {tokenError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {tokenError}
                </div>
              )}

              {/* API Error */}
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Form */}
              {token && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#45464d] mb-1.5 uppercase tracking-wide">
                      Username
                    </label>
                    <input
                      id="invite-username"
                      name="username"
                      type="text"
                      required
                      value={form.username}
                      onChange={handleChange}
                      placeholder="jurist_alpha"
                      className="w-full px-4 py-3 bg-[#eceef0] rounded-xl text-sm text-[#0F172A] placeholder-[#76777d] outline-none focus:ring-2 focus:ring-[#0F172A] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#45464d] mb-1.5 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="invite-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••••"
                        className="w-full px-4 py-3 bg-[#eceef0] rounded-xl text-sm text-[#0F172A] placeholder-[#76777d] outline-none focus:ring-2 focus:ring-[#0F172A] transition pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#76777d] hover:text-[#0F172A]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Invite info */}
                  <div className="bg-emerald-50 rounded-xl px-4 py-3 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Trusted Status</p>
                      <p className="text-xs text-emerald-600 mt-0.5">
                        You'll automatically receive Trusted User status with +2 voting weight bonus.
                      </p>
                    </div>
                  </div>

                  <button
                    id="accept-invite-btn"
                    type="submit"
                    disabled={isLoading || !token}
                    className="w-full py-3.5 bg-gradient-to-br from-[#0F172A] to-[#131b2e] text-white font-display font-semibold rounded-xl text-sm tracking-wide hover:opacity-90 transition disabled:opacity-60 mt-2"
                  >
                    {isLoading ? 'Processing...' : 'Join the Platform'}
                  </button>
                </form>
              )}

              {/* Login link */}
              <p className="text-center text-sm text-[#45464d]">
                Already a Jurist?{' '}
                <Link to="/login" className="text-[#0F172A] font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
