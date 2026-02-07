import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import AdminLogin from "./pages/AdminLogin";
import AdminUsers from './pages/AdminUsers';
import Header from "./components/Header";
import Footer from "./components/Footer";


// Protected route component to handle authentication
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Admin route component to handle admin authentication
function AdminRoute({ children }) {
  const isAuthenticated = localStorage.getItem('token') !== null;
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = userData.role === 'admin';

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

// Layout component to handle header and user state
function Layout({ children }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Get user data from localStorage
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      setUser(userData);
    } else {
      setUser(null);
    }
    
    // Listen for login/logout events
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (token) {
        setUser(userData);
      } else {
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('loginSuccess', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('loginSuccess', handleStorageChange);
    };
  }, []);

  return (
    <>
      <Header user={user} />
      {children}
      <Footer />
    </>
  );
}

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ["/login", "/signup", "/admin"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <Routes>
      {/* Public routes without layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/admin" element={<AdminLogin />} />
      
      {/* Admin routes */}
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            {shouldHideHeader ? <AdminUsers /> : <Layout><AdminUsers /></Layout>}
          </AdminRoute>
        } 
      />
      
      {/* Public routes with layout */}
      <Route 
        path="/" 
        element={
          shouldHideHeader ? <HomePage /> : <Layout><HomePage /></Layout>
        } 
      />
      
      <Route
        path="/services"
        element={
          shouldHideHeader ? <ServicesPage /> : <Layout><ServicesPage /></Layout>
        }
      />
      
      {/* Protected routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {shouldHideHeader ? <ProfilePage /> : <Layout><ProfilePage /></Layout>}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;