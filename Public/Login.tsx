
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { signInWithEmail, signInWithGoogle } from '../../services/firebase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mx-auto mb-4">S</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Showcase</h1>
          <p className="text-slate-500 mt-2 font-medium">Welcome back! Sign in to manage your catalogs.</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium transition-all" 
              />
            </div>
            <div className="relative">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium transition-all" 
              />
            </div>

            <div className="text-right">
              <button type="button" className="text-sm font-bold text-[#2563EB] hover:text-blue-700 transition-colors">
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2563EB] text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <span className="relative px-4 bg-white text-slate-400 text-xs font-bold uppercase tracking-wider">Or continue with</span>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Don't have an account? {' '}
          <Link to="/signup" className="text-[#2563EB] font-black hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
