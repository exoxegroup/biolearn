
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/common/Spinner';
import { UserRole, Gender } from '../../types';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [gender, setGender] = useState<Gender>('MALE');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUser = await register(name, email, password, role, gender);
      if (newUser) {
        toast.success('Registration successful!');
        if (!newUser.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          const targetDashboard = newUser.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard';
          navigate(targetDashboard);
        }
      } else {
        toast.error('An account with this email may already exist.');
      }
    } catch (err) {
      toast.error('An error occurred during registration.');
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
          <h2 className="text-3xl font-bold text-teal-600">Create Account</h2>
          <p className="mt-2 text-slate-600">Join BioLearn AI to start your journey.</p>
        </div>
        


        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="role" className="block text-sm font-medium text-slate-700">I am a...</label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="gender" className="block text-sm font-medium text-slate-700">Gender</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400">
            {loading ? <Spinner size="sm" color="text-white" /> : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;