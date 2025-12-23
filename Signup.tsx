
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, TagIcon } from '@heroicons/react/24/outline';
import { signUpWithEmail } from '../../services/firebase';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    businessType: 'Restaurant',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const businessTypes = ['Restaurant', 'Coffee Shop', 'Retail Store', 'Professional Service', 'Real Estate', 'Other'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validations
    if (formData.businessName.trim().length < 3) {
      return setError('Business name must be at least 3 characters.');
    }
    if (formData.email.trim().length < 5 || !formData.email.includes('@')) {
      return setError('Please enter a valid email address.');
    }
    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (formData.phone.trim().length < 5) {
      return setError('Please enter a valid phone number.');
    }
    
    setLoading(true);
    try {
      // Fix: signUpWithEmail throws on failure, so we rely on the catch block for error handling
      // This resolves the TS error where 'result.error' was being accessed on a success-only return type
      await signUpWithEmail(
        formData.email, 
        formData.password, 
        formData.businessName,
        formData.businessType,
        formData.phone
      );
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-200 mx-auto mb-4">S</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2 font-medium">Start showcasing your business to the world.</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200 border border-slate-100">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Business Name Field */}
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                name="businessName"
                type="text" 
                required
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Business Name" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium transition-all" 
              />
            </div>

            {/* Business Type Field */}
            <div className="relative">
              <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select 
                name="businessType"
                required
                value={formData.businessType}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium transition-all appearance-none"
              >
                {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Phone Number Field */}
            <div className="relative">
              <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                name="phone"
                type="tel" 
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium transition-all" 
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                name="email"
                type="email" 
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium transition-all" 
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                name="password"
                type="password" 
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (min 6 chars)" 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#2563EB] font-medium transition-all" 
              />
            </div>

            {/* Primary Action Button - Showcase Accent Color */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#F97316] text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Get Started Free'}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-500 font-medium">
          Already have an account? {' '}
          <Link to="/login" className="text-[#2563EB] font-black hover:underline transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
