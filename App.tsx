import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { User } from './types';
import { authApi } from './services/api';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import RequestsListPage from './pages/RequestsListPage';
import RequestDetailPage from './pages/RequestDetailPage';
import UsersListPage from './pages/UsersListPage';
import UserDetailPage from './pages/UserDetailPage';

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const token = localStorage.getItem('turan_admin_token');
    if (token) {
      authApi.getMe().then(u => setUser(u)).catch(() => localStorage.removeItem('turan_admin_token')).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('turan_admin_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('turan_admin_token');
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Wrapper
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const App: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout user={user} onLogout={logout} />}>
           <Route path="dashboard" element={<DashboardPage />} />
           
           <Route path="requests" element={<RequestsListPage />} />
           <Route path="requests/:id" element={<RequestDetailPage />} />
           
           <Route path="users" element={<UsersListPage />} />
           <Route path="users/:id" element={<UserDetailPage />} />

           <Route path="branches" element={<div className="p-8">بخش مدیریت شعب (به زودی)</div>} />
           <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={user ? "/admin/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}