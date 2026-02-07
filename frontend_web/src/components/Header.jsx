import { useEffect, useState } from 'react';  
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Search, ShoppingBag, Menu, PawPrint, LogOut, User } from 'lucide-react';

import logout from '../assets/logout.gif';

import Avatar from './ui/Avatar';

export default function Header({ activePage = 'home' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  // Debug activePage
  console.log('Header activePage:', activePage);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            setUser({ name: 'User', avatar: '/default-avatar.png' });
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    const handleLoginSuccess = () => {
      checkAuth();
    };
    
    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);
  
  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem("email");
      localStorage.removeItem("id");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.clear();
      
      setIsAuthenticated(false);
      setUser(null);
      setShowDropdown(false);
      setIsLoggingOut(false);
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent("logoutSuccess"));
      
      navigate('/login');
    }, 1500);
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.avatar-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-red-100">
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50">
          <img 
            src={logout}
            alt="Logging out..." 
            className="w-32 h-32 object-contain"
          />
          <div className="text-center mt-4">
            <p className="text-white text-lg font-medium">Logging you out...</p>
            <p className="text-gray-300 text-sm mt-1">Please wait while we secure your session</p>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - Updated to red */}
        <div className="flex items-center gap-2">
          <PawPrint className="h-8 w-8 text-red-600" />
          <span className="font-bold text-2xl text-red-700">Zootopia</span>
        </div>

        {/* Navigation - Updated to red */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            to="/"
            className={`font-medium ${activePage === 'home' ? 'text-red-700 hover:text-red-600' : 'text-gray-600 hover:text-red-700'}`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`font-medium ${activePage === 'products' ? 'text-red-700 hover:text-red-600' : 'text-gray-600 hover:text-red-700'}`}
          >
            Products
          </Link>
          <Link
            to="/services"
            className={`font-medium ${activePage === 'services' ? 'text-red-700 hover:text-red-600' : 'text-gray-600 hover:text-red-700'}`}
          >
            Services
          </Link>
          <Link
            to="/about"
            className={`font-medium ${activePage === 'about' ? 'text-red-700 hover:text-red-600' : 'text-gray-600 hover:text-red-700'}`}
          >
            About Us
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Cart Button - Updated to red */}
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-red-700 hover:bg-red-50">
            <Link to="/cart" className="text-gray-600 hover:text-red-700 inline-flex items-center justify-center p-2 rounded-full hover:bg-red-50 focus:ring focus:ring-red-200">
              <ShoppingBag className="h-5 w-5" />
            </Link>
          </Button>

          {isLoading ? (
            <div className="w-9 h-9"></div>
          ) : isAuthenticated && user ? (
            <div className="relative avatar-dropdown">
              <div 
                className="cursor-pointer hover:ring-2 hover:ring-red-200 rounded-full transition-all" 
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Avatar className="h-9 w-9 flex items-center justify-center border border-red-200">
                  <User className="h-5 w-5 text-red-700" />
                  <Avatar.Fallback className="text-red-700 bg-red-100">{(user?.name?.[0] || 'U').toUpperCase()}</Avatar.Fallback>
                </Avatar>
              </div>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-red-100">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-red-100">
                    <div className="font-medium text-red-800">Signed in as</div>
                    <div className="truncate text-red-700">{user?.name || 'User'}</div>
                  </div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    Your Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowDropdown(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button className="hidden md:flex bg-red-700 hover:bg-red-600 text-white border-red-700" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-gray-600 hover:text-red-700 hover:bg-red-50">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}