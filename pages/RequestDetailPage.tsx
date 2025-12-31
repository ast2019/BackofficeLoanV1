import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi, configApi } from '../services/api';
import { LoanRequestStatus, UserRole } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import TTShahrBadge from '../components/ui/TTShahrBadge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import NotesPanel from '../components/ui/NotesPanel';
import SmsLogsPanel from '../components/ui/SmsLogsPanel';
import { useAuth } from '../App';
import { 
  ArrowRight, FileText, Download, CheckCircle, 
  XCircle, Clock, Upload, Circle, UserCheck, 
  Banknote, ShieldAlert, AlertTriangle
} from 'lucide-react';

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
  
  // Forms
  const [letterData, setLetterData] = useState({ number: '', date: '' });
  const [bankData, setBankData] = useState({ approved: true, reason: '', amount: '' });

  // Permissions Helpers
  const canIssueLetter = [UserRole.SuperAdmin, UserRole.SeniorAdmin, UserRole.Admin].includes(user?.role as UserRole);
  const canRecordBank = [UserRole.SuperAdmin, UserRole.FinanceAdmin].includes(user?.role as UserRole);
  const canCloseRequest = [UserRole.SuperAdmin, UserRole.SeniorAdmin].includes(user?.role as UserRole);
  const canResendSms = user?.role === UserRole.SuperAdmin;

  // Queries
  const { data: req, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => requestsApi.getRequestById(id!),
    enabled: !!id
  });

  const { data: appConfig } = useQuery({
    queryKey: ['config'],
    queryFn: configApi.getConfig
  });

  const { data: notes } = useQuery({
    queryKey: ['request-notes', id],
    queryFn: () => requestsApi.getNotes(id!),
    enabled: !!id
  });

  const { data: smsLogs } = useQuery({
    queryKey: ['request-sms', id],
    queryFn: () => requestsApi.getSmsLogs(id!),
    enabled: !!id
  });

  // Mutations
  const issueLetterMutation = useMutation({
    mutationFn: (data: any) => requestsApi.issueLetter(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      setIsLetterModalOpen(false);
    }
  });

  const bankResultMutation = useMutation({
    mutationFn: (data: any) => requestsApi.recordBankResult(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      setIsBankModalOpen(false);
    }
  });

  const closeMutation = useMutation({
    mutationFn: () => requestsApi.closeRequest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      setIsCloseModalOpen(false);
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: (text: string) => requestsApi.createNote(id!, text, user?.name || 'Admin'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['request-notes', id] })
  });

  const resendSmsMutation = useMutation({
    mutationFn: (logId: string) => requestsApi.resendSms(logId),
    onSuccess: () => alert("پیامک مجددا ارسال شد.")
  });

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
      case LoanRequestStatus.BankRejected: return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default: return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!req) return <div className="p-10 text-center text-red-500">Request not found</div>;

  const currentStepIndex = STEPS.findIndex(s => s.id === req.status);
  const isRejected = req.status === LoanRequestStatus.RejectedByShahkar || req.status === LoanRequestStatus.BankRejected;
  const isClosed = req.status === LoanRequestStatus.Closed;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">درخواست {req.requestNumber}</h1>
          <p className="text-sm text-gray-500">{req.fullName} | {req.mobile}</p>
        </div>
        <div className="ms-auto flex gap-2">
           <TTShahrBadge isRegistered={req.ttshahrStatus} />
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
           <div className="absolute top-4 start-0 w-full h-0.5 bg-gray-200 -z-0">
             <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">اطلاعات پرونده</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div><span className="text-gray-500 block mb-1">کد ملی</span><span className="font-mono">{req.nationalId}</span></div>
              <div><span className="text-gray-500 block mb-1">مبلغ وام</span><span className="font-medium">{req.amountToman.toLocaleString()} تومان</span></div>
              <div><span className="text-gray-500 block mb-1">بازپرداخت</span><span>{req.tenorMonths} ماهه</span></div>
              <div><span className="text-gray-500 block mb-1">شعبه</span><span>{req.branch.name}</span></div>
              {req.bankResult?.paidAt && (
                <div className="col-span-2 bg-green-50 p-3 rounded mt-2">
                  <span className="text-green-800">پرداخت شده در: {new Date(req.bankResult.paidAt).toLocaleDateString('fa-IR')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Files */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">فایل‌ها و مدارک</h3>
             {req.letter ? (
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-medium text-indigo-900">معرفی‌نامه بانکی</p>
                      <p className="text-xs text-indigo-600">شماره: {req.letter.letterNumber} | تاریخ: {new Date(req.letter.issuedAt).toLocaleDateString('fa-IR')}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-indigo-700">
                    <Download className="w-4 h-4 me-1" /> دانلود
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">معرفی‌نامه‌ای موجود نیست.</p>
              )}
          </div>
          
          {/* SMS Logs */}
          <SmsLogsPanel 
            logs={smsLogs || []} 
            canResend={canResendSms} 
            onResend={(id) => resendSmsMutation.mutate(id)} 
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">عملیات</h3>
            <div className="flex flex-col gap-3">
              {/* Issue Letter */}
              {req.status === LoanRequestStatus.WaitingForLetter && canIssueLetter && (
                <Button onClick={() => setIsLetterModalOpen(true)}>
                  {appConfig?.letterMode === 'auto' ? 'صدور خودکار معرفی‌نامه' : 'آپلود معرفی‌نامه دستی'}
                </Button>
              )}

              {/* Record Bank */}
              {req.status === LoanRequestStatus.WaitingForBankApproval && canRecordBank && (
                <Button onClick={() => setIsBankModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  ثبت نتیجه بانک / واریز
                </Button>
              )}

              {/* Close/Cancel */}
              {!isClosed && !isRejected && req.status !== LoanRequestStatus.LoanPaid && canCloseRequest && (
                <Button variant="danger" onClick={() => setIsCloseModalOpen(true)}>
                  <XCircle className="w-4 h-4 me-2" />
                  لغو / بستن درخواست
                </Button>
              )}
              
              {/* Fallback View */}
              {isClosed && <div className="p-3 bg-gray-100 text-gray-600 text-sm rounded text-center">پرونده بسته شده است.</div>}
            </div>
          </div>

          {/* Timeline History */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">تاریخچه تغییرات</h3>
            <div className="relative border-r-2 border-gray-100 me-2 space-y-6">
              {req.history && req.history.map((h, i) => (
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
                        {h.changedBy}
                    </span>
                    {h.note && (
                      <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {h.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <NotesPanel 
             notes={notes || []} 
             onAddNote={(text) => addNoteMutation.mutate(text)} 
             isLoading={addNoteMutation.isPending} 
          />
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isLetterModalOpen} 
        onClose={() => setIsLetterModalOpen(false)} 
        title={appConfig?.letterMode === 'auto' ? "صدور معرفی‌نامه" : "آپلود معرفی‌نامه"}
        footer={
           <>
             <Button variant="ghost" onClick={() => setIsLetterModalOpen(false)}>انصراف</Button>
             <Button onClick={() => issueLetterMutation.mutate(letterData)} isLoading={issueLetterMutation.isPending}>
               {appConfig?.letterMode === 'auto' ? 'صدور و ارسال پیامک' : 'ثبت و آپلود'}
             </Button>
           </>
        }
      >
        <div className="space-y-4">
           {appConfig?.letterMode === 'manual' ? (
             <>
               <p className="text-sm text-gray-600">لطفاً فایل اسکن شده معرفی‌نامه را آپلود کنید.</p>
               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer">
                 <Upload className="mx-auto h-8 w-8 text-gray-400" />
                 <span className="text-xs text-gray-500 mt-2 block">کلیک برای انتخاب فایل</span>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">شماره نامه</label>
                  <input type="text" className="w-full border rounded p-2 text-sm" value={letterData.number} onChange={e=>setLetterData({...letterData, number: e.target.value})} />
               </div>
             </>
           ) : (
             <p className="text-sm text-gray-600">
               معرفی‌نامه به صورت سیستمی با مهر و امضای دیجیتال برای <strong>{req.fullName}</strong> صادر خواهد شد.
             </p>
           )}
        </div>
      </Modal>

      <Modal 
        isOpen={isBankModalOpen} 
        onClose={() => setIsBankModalOpen(false)} 
        title="ثبت نتیجه بانک"
        footer={
           <>
             <Button variant="ghost" onClick={() => setIsBankModalOpen(false)}>انصراف</Button>
             <Button onClick={() => bankResultMutation.mutate(bankData)} isLoading={bankResultMutation.isPending}>ثبت نهایی</Button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">مبلغ پرداختی</label>
                <input type="number" className="w-full border rounded p-2" value={bankData.amount} onChange={e=>setBankData({...bankData, amount: e.target.value})} placeholder={req.amountToman.toString()} />
             </div>
           ) : (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">دلیل رد</label>
               <textarea className="w-full border rounded p-2" rows={3} value={bankData.reason} onChange={e=>setBankData({...bankData, reason: e.target.value})}></textarea>
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
             <Button variant="danger" onClick={() => closeMutation.mutate()} isLoading={closeMutation.isPending}>بله، ببند</Button>
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