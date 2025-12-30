import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { requestsApi } from '../services/api';
import { LoanRequestStatus } from '../types';
import { Clock, CheckCircle2, Banknote, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';

const DashboardPage: React.FC = () => {
  // Simulating dashboard data fetching by getting all requests (In real app, use dedicated dashboard stats API)
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => requestsApi.getRequests({ page: 1, pageSize: 100 })
  });

  const stats = React.useMemo(() => {
    if (!data?.data) return { waitingLetter: 0, letterIssued: 0, waitingBank: 0, paid: 0 };
    return {
      waitingLetter: data.data.filter(r => r.status === LoanRequestStatus.WaitingForLetter).length,
      letterIssued: data.data.filter(r => r.status === LoanRequestStatus.LetterIssued).length,
      waitingBank: data.data.filter(r => r.status === LoanRequestStatus.WaitingForBankApproval).length,
      paid: data.data.filter(r => r.status === LoanRequestStatus.LoanPaid).length,
    };
  }, [data]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">داشبورد</h2>
        <p className="text-gray-500 mt-1">نمای کلی وضعیت درخواست‌های تسهیلات</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="منتظر صدور معرفی‌نامه" 
          value={stats.waitingLetter} 
          icon={AlertCircle} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="معرفی‌نامه صادر شده" 
          value={stats.letterIssued} 
          icon={File} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="منتظر تایید بانک" 
          value={stats.waitingBank} 
          icon={Clock} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="وام‌های پرداخت شده" 
          value={stats.paid} 
          icon={Banknote} 
          color="bg-green-500" 
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">اقدامات فوری</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">در حال بارگذاری...</div>
          ) : data?.data.slice(0, 5).map((req) => (
            <div key={req.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                  {req.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{req.fullName}</p>
                  <p className="text-xs text-gray-500">{req.requestNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={req.status} />
                <span className="text-sm text-gray-400">
                  {new Date(req.updatedAt).toLocaleDateString('fa-IR')}
                </span>
              </div>
            </div>
          ))}
          {(!isLoading && (!data?.data || data.data.length === 0)) && (
            <div className="p-6 text-center text-gray-500">موردی برای نمایش وجود ندارد.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple File Icon Mock
const File = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default DashboardPage;