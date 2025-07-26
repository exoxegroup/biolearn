
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../../components/common/Spinner';

const CompleteProfilePage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !address) {
      setError('Please fill out all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updateProfile({ phone, address });
      const targetDashboard = user?.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard';
      navigate(targetDashboard);
    } catch (err) {
      setError('An error occurred. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-teal-600">Complete Your Profile</h2>
          <p className="mt-2 text-slate-600">Just a few more details to get you started, {user?.name}.</p>
        </div>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="+234 800 000 0000"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="123 Learning Way, City, State"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
          >
            {loading ? <Spinner size="sm" color="text-white" /> : 'Save and Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;