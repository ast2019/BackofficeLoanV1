import React from 'react';
import { LoanRequestStatus } from '../../types';

interface StatusBadgeProps {
  status: LoanRequestStatus;
}

const statusConfig: Record<LoanRequestStatus, { label: string; color: string; bg: string }> = {
  [LoanRequestStatus.Submitted]: { label: 'ثبت شده', color: 'text-blue-700', bg: 'bg-blue-50' },
  [LoanRequestStatus.IdentityCheck]: { label: 'بررسی هویت', color: 'text-purple-700', bg: 'bg-purple-50' },
  [LoanRequestStatus.RejectedByShahkar]: { label: 'رد شده (شاهکار)', color: 'text-red-700', bg: 'bg-red-50' },
  [LoanRequestStatus.WaitingForLetter]: { label: 'منتظر معرفی‌نامه', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  [LoanRequestStatus.LetterIssued]: { label: 'معرفی‌نامه صادر شد', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  [LoanRequestStatus.WaitingForBankApproval]: { label: 'منتظر تایید بانک', color: 'text-orange-700', bg: 'bg-orange-50' },
  [LoanRequestStatus.LoanPaid]: { label: 'پرداخت شده', color: 'text-green-700', bg: 'bg-green-50' },
  [LoanRequestStatus.Closed]: { label: 'بسته شده', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-50' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;