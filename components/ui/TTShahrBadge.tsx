import React from 'react';

interface TTShahrBadgeProps {
  isRegistered: boolean;
  lastCheckedAt?: string;
}

const TTShahrBadge: React.FC<TTShahrBadgeProps> = ({ isRegistered, lastCheckedAt }) => {
  return (
    <div className="flex flex-col items-start">
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isRegistered ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
        {isRegistered ? 'ثبت‌نام در تی‌تی‌شهر' : 'عدم ثبت‌نام تی‌تی‌شهر'}
      </span>
      {lastCheckedAt && (
        <span className="text-[10px] text-gray-400 mt-0.5">
          بروزرسانی: {new Date(lastCheckedAt).toLocaleDateString('fa-IR')}
        </span>
      )}
    </div>
  );
};

export default TTShahrBadge;