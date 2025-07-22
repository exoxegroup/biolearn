
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User as UserIcon } from 'lucide-react';

const Header: React.FC<{ title: string }> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    return user.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard';
  }

  return (
    <header className="bg-white shadow-md w-full p-4 flex justify-between items-center">
      <Link to={getDashboardLink()} className="text-2xl font-bold text-teal-600">
        BioLearn AI
        {title && <span className="text-slate-500 font-normal text-xl"> / {title}</span>}
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <UserIcon size={20} />
            <span className="font-medium">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
