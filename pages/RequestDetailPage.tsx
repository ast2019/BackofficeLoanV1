import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '../services/api';
import { LoanRequestStatus, UserRole } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../App';
import { 
  ArrowRight, 
  AlertTriangle, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Clock, 
  Banknote, 
  ShieldAlert 
} from 'lucide-react';

// Steps for the stepper
const STEPS = [
  { id: LoanRequestStatus.Submitted, label: 'ثبت درخواست' },
  { id: LoanRequestStatus.IdentityCheck, label: 'احراز هویت' },
  { id: LoanRequestStatus.WaitingForLetter, label: 'انتظار معرفی‌نامه' },
  { id: LoanRequestStatus.LetterIssued, label: 'صدور معرفی‌نامه' },
  { id: LoanRequestStatus.WaitingForBankApproval, label: 'انتظار بانک' },
  { id: LoanRequestStatus.LoanPaid, label: 'پرداخت وام' },
];

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  
  // Forms state
  const [letterData, setLetterData] = useState({ number: '', date: '' });
  const [bankData, setBankData] = useState({ approved: true, reason: '', amount: '' });

  const { data: req, isLoading, isError } = useQuery({
    queryKey: ['request', id],
    queryFn: () => requestsApi.getRequestById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll if in waiting status
      const status = query.state.data?.status;
      return (status === LoanRequestStatus.WaitingForLetter || status === LoanRequestStatus.WaitingForBankApproval) 
        ? 15000 : false;
    }
  });

  const issueLetterMutation = useMutation({
    mutationFn: (data: any) => requestsApi.issueLetter(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['request', id]);
      setIsLetterModalOpen(false);
    }
  });

  const bankResultMutation = useMutation({
    mutationFn: (data: any) => requestsApi.recordBankResult(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['request', id]);
      setIsBankModalOpen(false);
    }
  });

  const closeMutation = useMutation({
    mutationFn: () => requestsApi.closeRequest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries(['request', id]);
      setIsCloseModalOpen(false);
    }
  });

  const retryShahkarMutation = useMutation({
    mutationFn: () => requestsApi.retryShahkar(id!),
    onSuccess: () => queryClient.invalidateQueries(['request', id])
  });

  if (isLoading) return <div className="p-10 text-center">در حال بارگذاری...</div>;
  if (isError || !req) return <div className="p-10 text-center text-red-500">درخواست یافت نشد.</div>;

  // Find active step index
  const currentStepIndex = STEPS.findIndex(s => s.id === req.status);
  // Handle rejected/closed logic for stepper visual
  const isRejected = req.status === LoanRequestStatus.RejectedByShahkar;
  const isClosed = req.status === LoanRequestStatus.Closed;

  const getTimelineIcon = (status: LoanRequestStatus) => {
    switch (status) {
      case LoanRequestStatus.Submitted: return <FileText className="w-4 h-4 text-blue-600" />;
      case LoanRequestStatus.IdentityCheck: return <UserCheck className="w-4 h-4 text-purple-600" />;
      case LoanRequestStatus.RejectedByShahkar: return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case LoanRequestStatus.WaitingForLetter: return <Clock className="w-4 h-4 text-yellow-600" />;
      case LoanRequestStatus.LetterIssued: return <FileText className="w-4 h-4 text-indigo-600" />;
      case LoanRequestStatus.WaitingForBankApproval: return <Banknote className="w-4 h-4 text-orange-600" />;
      case LoanRequestStatus.LoanPaid: return <CheckCircle className="w-4 h-4 text-green-600" />;
      case LoanRequestStatus.Closed: return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">جزئیات درخواست {req.requestNumber}</h1>
          <p className="text-sm text-gray-500">{req.fullName} | {new Date(req.createdAt).toLocaleDateString('fa-IR')}</p>
        </div>
        <div className="ms-auto">
           <StatusBadge status={req.status} />
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <div className="flex items-center min-w-[600px] justify-between relative">
           {STEPS.map((step, idx) => {
             const isCompleted = currentStepIndex > idx || req.status === LoanRequestStatus.LoanPaid;
             const isCurrent = currentStepIndex === idx;
             
             let circleClass = "bg-gray-200 text-gray-500";
             if (isCompleted) circleClass = "bg-green-500 text-white";
             if (isCurrent) circleClass = "bg-brand text-white ring-4 ring-brand/20";
             if ((isRejected || isClosed) && isCurrent) circleClass = "bg-red-500 text-white";

             return (
               <div key={step.id} className="flex flex-col items-center z-10 relative">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${circleClass}`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : (idx + 1)}
                 </div>
                 <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-500'}`}>
                   {step.label}
                 </span>
               </div>
             );
           })}
           {/* Connecting Line */}
           <div className="absolute top-4 start-0 w-full h-0.5 bg-gray-200 -z-0">
             <div 
               className="h-full bg-green-500 transition-all duration-500" 
               style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}
             ></div>
           </div>
        </div>
        {(isRejected) && (
           <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-800 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5" />
             <span>این درخواست توسط سامانه شاهکار رد شده است. لطفاً مدارک کاربر را بررسی کنید.</span>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">اطلاعات کلی</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">کد ملی</span>
                <span className="font-mono text-gray-900 font-medium">{req.nationalId}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">شماره موبایل</span>
                <span className="font-mono text-gray-900 font-medium">{req.mobile}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">مبلغ درخواستی</span>
                <span className="text-gray-900 font-medium">{req.amountToman.toLocaleString()} تومان</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">مدت بازپرداخت</span>
                <span className="text-gray-900 font-medium">{req.tenorMonths} ماهه</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">شعبه انتخابی</span>
                <span className="text-gray-900 font-medium">{req.branch.name} ({req.branch.code})</span>
              </div>
            </div>
          </div>
          
           {/* Files / Documents */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">فایل‌ها و مدارک</h3>
            <div className="space-y-3">
              {req.letter ? (
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-medium text-indigo-900">معرفی‌نامه بانکی</p>
                      <p className="text-xs text-indigo-600">شماره: {req.letter.letterNumber} | تاریخ: {new Date(req.letter.issuedAt).toLocaleDateString('fa-IR')}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-indigo-700 hover:text-indigo-800 hover:bg-indigo-100">
                    <Download className="w-4 h-4 me-1" /> دانلود
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">هنوز معرفی‌نامه صادر نشده است.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions & History */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">عملیات مدیریت</h3>
            <div className="flex flex-col gap-3">
              
              {/* Context Aware Buttons */}
              {req.status === LoanRequestStatus.RejectedByShahkar && (
                <Button 
                  onClick={() => retryShahkarMutation.mutate()} 
                  isLoading={retryShahkarMutation.isLoading}
                  variant="outline"
                >
                  استعلام مجدد شاهکار
                </Button>
              )}

              {req.status === LoanRequestStatus.WaitingForLetter && (
                <Button onClick={() => setIsLetterModalOpen(true)}>
                  صدور معرفی‌نامه
                </Button>
              )}

              {req.status === LoanRequestStatus.WaitingForBankApproval && (
                <Button onClick={() => setIsBankModalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                  ثبت نتیجه بانک
                </Button>
              )}

              {/* Close Action - Always available if not already closed/paid (simplified logic) */}
              {req.status !== LoanRequestStatus.Closed && req.status !== LoanRequestStatus.LoanPaid && user?.role !== UserRole.ReadOnly && (
                <Button 
                  variant="danger" 
                  onClick={() => setIsCloseModalOpen(true)}
                  isLoading={closeMutation.isLoading}
                >
                  <XCircle className="w-4 h-4 me-2" />
                  بستن درخواست
                </Button>
              )}

              {req.status === LoanRequestStatus.LoanPaid && (
                <div className="p-3 bg-green-50 text-green-800 rounded text-center text-sm">
                  فرآیند با موفقیت تکمیل شده است.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">تاریخچه تغییرات</h3>
            <div className="relative border-r-2 border-gray-100 me-2 space-y-6">
              {req.history.map((h, i) => (
                <div key={i} className="relative me-6">
                  <div className="absolute -right-[31px] top-1 w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm z-10">
                     {getTimelineIcon(h.status)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{h.status}</span> 
                    <span className="text-xs text-gray-500 mt-1">
                        {new Date(h.changedAt).toLocaleString('fa-IR')}
                    </span>
                    <span className="text-xs text-gray-400">
                        توسط: {h.changedBy}
                    </span>
                     {h.note && (
                       <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                         {h.note}
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isLetterModalOpen} 
        onClose={() => setIsLetterModalOpen(false)} 
        title="صدور معرفی‌نامه"
        footer={
           <>
             <Button variant="ghost" onClick={() => setIsLetterModalOpen(false)}>انصراف</Button>
             <Button onClick={() => issueLetterMutation.mutate(letterData)} isLoading={issueLetterMutation.isLoading}>تایید و صدور</Button>
           </>
        }
      >
        <div className="space-y-4">
           <p className="text-sm text-gray-600">
             لطفاً اطلاعات معرفی‌نامه صادر شده برای <strong>{req.fullName}</strong> به مبلغ <strong>{req.amountToman.toLocaleString()}</strong> را وارد کنید.
           </p>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">شماره نامه</label>
             <input type="text" className="block w-full border-gray-300 rounded-md shadow-sm p-2 border" 
               value={letterData.number} onChange={e => setLetterData({...letterData, number: e.target.value})} />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ صدور</label>
             <input type="date" className="block w-full border-gray-300 rounded-md shadow-sm p-2 border" 
                value={letterData.date} onChange={e => setLetterData({...letterData, date: e.target.value})} />
           </div>
           <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded">
             در این نسخه دمو، نیازی به آپلود فایل واقعی نیست.
           </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isBankModalOpen} 
        onClose={() => setIsBankModalOpen(false)} 
        title="ثبت نتیجه بانک"
        footer={
           <>
             <Button variant="ghost" onClick={() => setIsBankModalOpen(false)}>انصراف</Button>
             <Button onClick={() => bankResultMutation.mutate(bankData)} isLoading={bankResultMutation.isLoading}>ثبت نهایی</Button>
           </>
        }
      >
        <div className="space-y-4">
           <div className="flex gap-4 mb-4">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="radio" name="approved" checked={bankData.approved} onChange={() => setBankData({...bankData, approved: true})} />
               <span className="text-sm">تایید و پرداخت شد</span>
             </label>
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="radio" name="approved" checked={!bankData.approved} onChange={() => setBankData({...bankData, approved: false})} />
               <span className="text-sm">رد شد</span>
             </label>
           </div>
           
           {bankData.approved ? (
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ نهایی پرداختی (تومان)</label>
                <input type="number" className="block w-full border-gray-300 rounded-md shadow-sm p-2 border" 
                  value={bankData.amount} onChange={e => setBankData({...bankData, amount: e.target.value})} placeholder={req.amountToman.toString()} />
             </div>
           ) : (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">دلیل رد درخواست</label>
               <textarea className="block w-full border-gray-300 rounded-md shadow-sm p-2 border" rows={3}
                  value={bankData.reason} onChange={e => setBankData({...bankData, reason: e.target.value})}></textarea>
             </div>
           )}
        </div>
      </Modal>

      <Modal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)} 
        title="بستن درخواست"
        footer={
           <>
             <Button variant="ghost" onClick={() => setIsCloseModalOpen(false)}>انصراف</Button>
             <Button variant="danger" onClick={() => closeMutation.mutate()} isLoading={closeMutation.isLoading}>بله، ببند</Button>
           </>
        }
      >
        <div className="space-y-4">
           <div className="p-4 bg-red-50 text-red-800 rounded-lg flex gap-3">
             <AlertTriangle className="w-6 h-6 shrink-0" />
             <p className="text-sm">
               آیا از بستن درخواست شماره <strong>{req.requestNumber}</strong> اطمینان دارید؟
               <br/>
               این عملیات باعث بایگانی شدن درخواست می‌شود و کاربر مجبور به ثبت درخواست جدید خواهد بود.
             </p>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default RequestDetailPage;