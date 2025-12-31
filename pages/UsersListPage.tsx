import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { usersApi } from '../services/api';
import { UserRole, UsersFilter } from '../types';
import { Link } from 'react-router-dom';
import RoleBadge from '../components/ui/RoleBadge';
import TTShahrBadge from '../components/ui/TTShahrBadge';
import Button from '../components/ui/Button';
import { Search, Eye } from 'lucide-react';

const UsersListPage: React.FC = () => {
  const [filter, setFilter] = useState<UsersFilter>({
    page: 1,
    pageSize: 10,
    search: '',
    role: undefined,
    ttshahrRegistered: undefined
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', filter],
    queryFn: () => usersApi.getUsers(filter),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">بروزرسانی</Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4 items-center">
         <div className="relative flex-1">
           <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
           <input 
             className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-brand"
             placeholder="جستجو (نام، موبایل، کدملی)..."
             value={filter.search}
             onChange={e => setFilter({...filter, search: e.target.value, page: 1})}
           />
         </div>
         <select className="border rounded-lg p-2 w-40" onChange={e => setFilter({...filter, role: e.target.value as UserRole || undefined})}>
            <option value="">همه نقش‌ها</option>
            {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
         </select>
         <select className="border rounded-lg p-2 w-40" onChange={e => setFilter({...filter, ttshahrRegistered: e.target.value === 'yes' ? true : e.target.value === 'no' ? false : undefined})}>
            <option value="">وضعیت تی‌تی‌شهر</option>
            <option value="yes">ثبت‌نام شده</option>
            <option value="no">عدم ثبت‌نام</option>
         </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="bg-gray-50 text-gray-700">
             <tr>
               <th className="px-6 py-3">نام</th>
               <th className="px-6 py-3">موبایل</th>
               <th className="px-6 py-3">نقش</th>
               <th className="px-6 py-3">تی‌تی‌شهر</th>
               <th className="px-6 py-3">عضویت</th>
               <th className="px-6 py-3">عملیات</th>
             </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="text-center py-8">در حال بارگذاری...</td></tr>}
            {data?.data.map(user => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4">{user.mobile}</td>
                <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                <td className="px-6 py-4"><TTShahrBadge isRegistered={user.ttshahr.isRegistered} /></td>
                <td className="px-6 py-4 dir-ltr text-right">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                <td className="px-6 py-4">
                  <Link to={`/admin/users/${user.id}`}>
                    <Button size="sm" variant="ghost"><Eye className="w-4 h-4 me-1"/> جزئیات</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersListPage;