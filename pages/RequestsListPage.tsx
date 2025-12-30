import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { requestsApi, branchesApi } from '../services/api';
import { LoanRequestStatus, RequestsFilter } from '../types';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { Search, Filter, Eye } from 'lucide-react';

const RequestsListPage: React.FC = () => {
  const [filter, setFilter] = useState<RequestsFilter>({
    page: 1,
    pageSize: 10,
    search: '',
    status: [],
    branchCode: undefined,
  });

  // Debounced search could be added here
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['requests', filter],
    queryFn: () => requestsApi.getRequests(filter),
    placeholderData: keepPreviousData,
  });

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: branchesApi.getAll
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as LoanRequestStatus | '';
    setFilter(prev => ({ 
      ...prev, 
      status: val ? [val] : [], 
      page: 1 
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">لیست درخواست‌ها</h2>
          <p className="text-sm text-gray-500">مدیریت و پیگیری درخواست‌های وام</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          بروزرسانی لیست
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            className="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-brand focus:border-brand" 
            placeholder="جستجو (کدملی، موبایل، شماره درخواست)..." 
            value={filter.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="w-full md:w-48">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5"
            onChange={handleStatusChange}
            value={filter.status?.[0] || ''}
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.values(LoanRequestStatus).map(s => (
              <option key={s} value={s}>{s}</option> // Ideally translate this key
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-brand focus:border-brand block w-full p-2.5"
            onChange={(e) => setFilter(prev => ({...prev, branchCode: e.target.value || undefined, page: 1}))}
            value={filter.branchCode || ''}
          >
            <option value="">همه شعب</option>
            {branches?.map(b => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">شماره درخواست</th>
                <th className="px-6 py-3">نام متقاضی</th>
                <th className="px-6 py-3">موبایل</th>
                <th className="px-6 py-3">مبلغ (تومان)</th>
                <th className="px-6 py-3">وضعیت</th>
                <th className="px-6 py-3">تاریخ</th>
                <th className="px-6 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div></div>
                  </td>
                </tr>
              )}
              {isError && (
                 <tr><td colSpan={7} className="px-6 py-4 text-center text-red-500">خطا در دریافت اطلاعات</td></tr>
              )}
              {!isLoading && data?.data.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">هیچ درخواستی یافت نشد</td></tr>
              )}
              {data?.data.map((req) => (
                <tr key={req.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{req.requestNumber}</td>
                  <td className="px-6 py-4">{req.fullName}</td>
                  <td className="px-6 py-4 dir-ltr text-right">{req.mobile}</td>
                  <td className="px-6 py-4">{req.amountToman.toLocaleString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  <td className="px-6 py-4 dir-ltr text-right">{new Date(req.createdAt).toLocaleDateString('fa-IR')}</td>
                  <td className="px-6 py-4">
                    <Link to={`/admin/requests/${req.id}`}>
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4 me-1" />
                        مشاهده
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-sm text-gray-700">
            نمایش <span className="font-semibold">{((filter.page - 1) * filter.pageSize) + 1}</span> تا <span className="font-semibold">{Math.min(filter.page * filter.pageSize, data?.total || 0)}</span> از <span className="font-semibold">{data?.total || 0}</span> درخواست
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={filter.page === 1}
              onClick={() => setFilter(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              قبلی
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={!data || data.data.length < filter.pageSize}
              onClick={() => setFilter(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              بعدی
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsListPage;