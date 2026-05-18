import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- IMPORT YOUR NEW LOGO HERE ---
import myLogo from '../assets/logo.jpg';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Training', to: '/training' },
  { label: 'Shop', to: '/shop' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/');
    setDropdownOpen(false);
    setOpen(false);
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-white py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* --- UPDATED LOGO SECTION --- */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={myLogo} 
              alt="North East Krishi Mitra" 
              className="w-12 h-12 rounded-lg object-contain"
            />
            {/* FIXED: Removed "hidden sm:block" so it shows on all screens! */}
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              NorthEastKrishiMitra
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors ${
                    isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth/User Section */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Desktop Cart Button */}
                <Link
                  to="/cart"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 border border-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                  title="My Cart"
                >
                  <ShoppingBag className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-gray-50 border border-gray-100 hover:bg-gray-100 px-4 py-2 rounded-full transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">
                      {profile?.full_name?.split(' ')[0] || 'Account'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 overflow-hidden z-50">
                      
                      {/* 1. MY PROFILE */}
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>

                      {/* 2. ADMIN DASHBOARD */}
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}

                      <hr className="my-1 border-gray-100" />
                      
                      {/* 3. SIGN OUT */}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-green-600 transition-colors px-4 py-2"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors px-5 py-2.5 rounded-full shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg z-50"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl px-4 py-6 flex flex-col gap-4 max-h-[calc(100vh-80px)] overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-base font-semibold px-4 py-3 rounded-xl transition-colors ${
                  isActive ? 'bg-green-50 text-green-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <hr className="border-gray-100 my-2" />

          {user ? (
            <div className="space-y-2">
              <div className="px-4 py-2 mb-2">
                <p className="text-sm font-bold text-gray-900">{profile?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ')}</p>
              </div>
              
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <User className="w-5 h-5 text-gray-400" /> My Profile
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="w-5 h-5 text-gray-400" /> Admin Dashboard
                </Link>
              )}
              
              <Link
                to="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ShoppingBag className="w-5 h-5 text-green-600" /> My Cart
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-center text-base font-semibold text-gray-700 border border-gray-200 px-4 py-3 rounded-xl hover:bg-gray-50"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="text-center text-base font-semibold text-white bg-green-600 px-4 py-3 rounded-xl hover:bg-green-700 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}