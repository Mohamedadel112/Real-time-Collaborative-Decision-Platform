import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Eye, EyeOff, AlertCircle } from 'lucide-react';
import useAuthStore from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', username: '', password: '' });

  const handleChange = (e) => {
    clearError();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ email: form.email, username: form.username, password: form.password });
      }
      navigate('/dashboard');
    } catch (_) {
      // error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Left panel – brand */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-16 relative overflow-hidden">
        {/* Background texture */}
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
          <p className="text-white/30 text-xs tracking-widest uppercase font-medium">Authoritative Clarity</p>
          <h1 className="font-display text-5xl font-bold text-white leading-tight">
            The Digital<br />Jurist Platform
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-md">
            Access the definitive platform for digital governance, high-stakes voting, 
            and judicial consensus through data-driven narratives.
          </p>
        </div>

        <div className="relative z-10 flex gap-8">
          {[['10k+', 'Active Jurists'], ['98%', 'Consensus Rate'], ['2.4M', 'Decisions Made']].map(([num, label]) => (
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

          {/* Header */}
          <div>
            <h2 className="font-display text-3xl font-bold text-[#0F172A]">
              {mode === 'login' ? 'Welcome Back' : 'Create Identity'}
            </h2>
            <p className="text-[#45464d] mt-1.5 text-sm">
              {mode === 'login'
                ? 'Sign in to your decision chamber.'
                : 'Join the platform and start participating.'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-[#45464d] mb-1.5 uppercase tracking-wide">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="jurist_alpha"
                  className="w-full px-4 py-3 bg-[#eceef0] rounded-xl text-sm text-[#0F172A] placeholder-[#76777d] outline-none focus:ring-2 focus:ring-[#0F172A] transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#45464d] mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="jurist@domain.com"
                className="w-full px-4 py-3 bg-[#eceef0] rounded-xl text-sm text-[#0F172A] placeholder-[#76777d] outline-none focus:ring-2 focus:ring-[#0F172A] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#45464d] uppercase tracking-wide">
                  Password
                </label>
                {mode === 'login' && (
                  <button type="button" className="text-xs text-[#0F172A] hover:underline font-medium">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
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

            <button
              id="submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-br from-[#0F172A] to-[#131b2e] text-white font-display font-semibold rounded-xl text-sm tracking-wide hover:opacity-90 transition disabled:opacity-60 mt-2"
            >
              {isLoading ? 'Processing...' : mode === 'login' ? 'Enter the Chamber' : 'Establish Identity'}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-[#45464d]">
            {mode === 'login' ? (
              <>New to the jurisdiction?{' '}
                <button
                  id="toggle-register"
                  onClick={() => { setMode('register'); clearError(); }}
                  className="text-[#0F172A] font-semibold hover:underline"
                >
                  Create an Identity
                </button>
              </>
            ) : (
              <>Already a Jurist?{' '}
                <button
                  id="toggle-login"
                  onClick={() => { setMode('login'); clearError(); }}
                  className="text-[#0F172A] font-semibold hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
