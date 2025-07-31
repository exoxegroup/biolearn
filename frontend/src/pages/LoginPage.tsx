
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/common/Spinner';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user) {
        if (!user.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          const targetDashboard = user.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard';
          navigate(targetDashboard);
        }
      } else {
        toast.error('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6 relative">
        <Link to="/" className="absolute top-4 left-4 text-slate-500 hover:text-teal-600 transition-colors">
          <ArrowLeft size={24}/>
        </Link>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-600">BioLearn AI</h2>
          <p className="mt-2 text-slate-600">Welcome back! Please sign in to your account.</p>
        </div>
        


        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
          >
            {loading ? <Spinner size="sm" color="text-white" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-teal-600 hover:text-teal-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;