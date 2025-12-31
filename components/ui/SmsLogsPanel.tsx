import React from 'react';
import { SmsLog } from '../../types';
import Button from './Button';
import { RefreshCw, MessageCircle } from 'lucide-react';

interface SmsLogsPanelProps {
  logs: SmsLog[];
  onResend?: (id: string) => void;
  canResend: boolean;
}

const SmsLogsPanel: React.FC<SmsLogsPanelProps> = ({ logs, onResend, canResend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-500" />
          لاگ پیامک‌ها
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="text-xs text-gray-700 bg-gray-50">
            <tr>
              <th className="px-4 py-2">نوع</th>
              <th className="px-4 py-2">وضعیت</th>
              <th className="px-4 py-2">تاریخ ارسال</th>
              <th className="px-4 py-2">موبایل</th>
              {canResend && <th className="px-4 py-2">عملیات</th>}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center">هیچ پیامکی یافت نشد.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-50">
                <td className="px-4 py-3">{log.type === 'letter_issued' ? 'صدور معرفی‌نامه' : log.type === 'loan_paid' ? 'پرداخت وام' : 'دستی'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {log.status === 'sent' ? 'ارسال شده' : 'ناموفق'}
                  </span>
                </td>
                <td className="px-4 py-3 dir-ltr text-right">{new Date(log.sentAt).toLocaleString('fa-IR')}</td>
                <td className="px-4 py-3">{log.mobile}</td>
                {canResend && (
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => onResend && onResend(log.id)} title="ارسال مجدد">
                      <RefreshCw className="w-3 h-3" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SmsLogsPanel;