import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
}

const roleConfig: Record<UserRole, { label: string; bg: string; text: string }> = {
  [UserRole.SuperAdmin]: { label: 'مدیر کل', bg: 'bg-red-100', text: 'text-red-800' },
  [UserRole.FinanceAdmin]: { label: 'مدیر مالی', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  [UserRole.SeniorAdmin]: { label: 'سرپرست اداری', bg: 'bg-purple-100', text: 'text-purple-800' },
  [UserRole.Admin]: { label: 'کارشناس اداری', bg: 'bg-blue-100', text: 'text-blue-800' },
  [UserRole.Borrower]: { label: 'کاربر (وام‌گیرنده)', bg: 'bg-gray-100', text: 'text-gray-600' },
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const config = roleConfig[role] || { label: role, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default RoleBadge;