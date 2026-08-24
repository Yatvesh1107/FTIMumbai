import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldCheck, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('admin@ftimumbai.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      const destination = user.role === 'student' ? '/student/dashboard' : '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick Preset Selector for Fast Switching (Admin vs Receptionist)
  const selectPreset = (pEmail, pPass) => {
    setEmail(pEmail);
    setPassword(pPass);
    setError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#082c4d] via-[#0b3c68] to-[#12518a] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="inline-block">
              <Logo className="h-12 mx-auto" />
            </Link>
            <h1 className="mt-4 font-display text-2xl font-black tracking-tight text-[#082c4d]">
              FTI Portal Login
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Access your Admin, Receptionist, or Student Workspace
            </p>
          </div>

          {/* Quick Switch Staff Role Buttons */}
          <div className="mt-6 rounded-2xl bg-slate-100 p-1.5 flex gap-1">
            <button
              type="button"
              onClick={() => selectPreset('admin@ftimumbai.com', 'admin123')}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                email === 'admin@ftimumbai.com'
                  ? 'bg-[#0b3c68] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => selectPreset('reception@ftimumbai.com', 'reception123')}
              className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                email === 'reception@ftimumbai.com'
                  ? 'bg-[#0b3c68] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receptionist Desk
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@ftimumbai.com or student email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#0b3c68] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b3c68]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Password</label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-[#0b3c68] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b3c68]/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0b3c68] to-[#12518a] py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-900/20 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[#0b3c68] transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Footer Back */}
          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-[#0b3c68] transition">
              ← Return to FTI Mumbai Main Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
