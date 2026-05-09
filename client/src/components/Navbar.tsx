// src/components/Navbar.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-700/40 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-lg font-bold text-gradient">
                EduVault
              </span>
              <p className="text-xs text-slate-500 font-body leading-none -mt-0.5">
                Student Management
              </p>
            </div>
          </div>

          {/* Desktop right side */}
          <div className="hidden sm:flex items-center gap-4">
            {/* User badge */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/40">
              <div className="w-6 h-6 rounded-full bg-primary-600/30 border border-primary-500/40 flex items-center justify-center">
                <User size={12} className="text-primary-400" />
              </div>
              <span className="text-xs text-slate-300 font-body">
                {user?._id ? `ID: ${user._id.slice(-6).toUpperCase()}` : 'Admin'}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-400 hover:text-red-400
                         px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-transparent
                         hover:border-red-500/20 transition-all duration-200 text-sm font-body"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-700/40 bg-slate-900/95 backdrop-blur-xl animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
              <div className="w-7 h-7 rounded-full bg-primary-600/30 border border-primary-500/40 flex items-center justify-center">
                <User size={14} className="text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-body">Logged in as</p>
                <p className="text-sm text-slate-200 font-body font-medium">
                  {user?._id ? `ID: ${user._id.slice(-6).toUpperCase()}` : 'Admin'}
                </p>
              </div>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="w-full flex items-center gap-2 text-red-400 px-3 py-2.5 rounded-xl
                         hover:bg-red-500/10 border border-red-500/20 transition-all duration-200
                         text-sm font-body font-medium"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
