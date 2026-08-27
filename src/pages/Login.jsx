import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, GraduationCap, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
  const [identifier, setIdentifier] = useState('admin@ftimumbai.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(identifier, password);
      const destination = user.role === 'student' ? '/student/dashboard' : '/admin/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  // Quick Preset Selector for Fast Role Switching
  const selectPreset = (pId, pPass) => {
    setIdentifier(pId);
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
              Super Admin, Receptionist, or Student Learning Workspace
            </p>
          </div>

          {/* Quick Switch Role Buttons (3 Panels) */}
          <div className="mt-6 rounded-2xl bg-slate-100 p-1.5 flex gap-1">
            <button
              type="button"
              onClick={() => selectPreset('admin@ftimumbai.com', 'admin123')}
              className={`flex-1 rounded-xl py-2 text-[11px] font-bold transition ${
                identifier === 'admin@ftimumbai.com'
                  ? 'bg-[#0b3c68] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => selectPreset('9632587410', '587410')}
              className={`flex-1 rounded-xl py-2 text-[11px] font-bold transition ${
                identifier === '9632587410'
                  ? 'bg-[#0b3c68] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Student
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
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email / Mobile / Enrollment No
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. rajdubey76890@gmail.com or 9632587410"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:border-[#0b3c68] focus:outline-none"
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
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 focus:border-[#0b3c68] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0b3c68] to-[#12518a] py-3 text-xs font-bold text-white shadow-lg transition hover:from-[#082c4d] hover:to-[#0b3c68] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to Learning Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Help Info */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-500">
              Students can login using their registered <strong>Email</strong>, <strong>Mobile No</strong>, or <strong>Enrollment No</strong> (e.g. FTI-2026-0001).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
