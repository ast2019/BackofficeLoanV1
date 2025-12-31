import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { LayoutDashboard, FileText, Building2, LogOut, User, Menu, X, Users, Settings } from 'lucide-react';
import RoleBadge from '../ui/RoleBadge';

interface AdminLayoutProps {
  user: { name: string; role: string; avatar?: string } | null;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'داشبورد', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'درخواست‌های وام', href: '/admin/requests', icon: FileText },
    { name: 'مدیریت کاربران', href: '/admin/users', icon: Users },
  ];
  
  // Only SuperAdmin sees settings (placeholder)
  if (user?.role === UserRole.SuperAdmin) {
     // navigation.push({ name: 'تنظیمات', href: '/admin/settings', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-gray-200 shadow-sm transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <span className="text-xl font-bold text-brand">سامانه توران</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 me-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <div className="flex flex-col gap-3 mb-4 px-2">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand shrink-0">
                 {user?.avatar ? <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" /> : <User className="w-6 h-6" />}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
               </div>
            </div>
            <div>
               {user && <RoleBadge role={user.role as UserRole} />}
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 me-3" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1"></div>
          
          <div className="flex items-center gap-4">
            {/* Header Actions */}
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;