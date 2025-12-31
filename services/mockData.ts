import { LoanRequest, LoanRequestStatus, UserRole, User, Branch, Note, SmsLog } from '../types';

export const MOCK_BRANCHES: Branch[] = [
  { 
    id: "b1", 
    code: "101", 
    name: "شعبه مرکزی", 
    city: "تهران", 
    isActive: true, 
    createdAt: "2023-01-01T00:00:00Z", 
    updatedAt: "2023-01-01T00:00:00Z" 
  },
  { 
    id: "b2", 
    code: "102", 
    name: "شعبه شمال تهران", 
    city: "تهران", 
    isActive: true, 
    createdAt: "2023-02-01T00:00:00Z", 
    updatedAt: "2023-02-01T00:00:00Z" 
  },
  { 
    id: "b3", 
    code: "201", 
    name: "شعبه اصفهان", 
    city: "اصفهان", 
    isActive: true, 
    createdAt: "2023-03-01T00:00:00Z", 
    updatedAt: "2023-03-01T00:00:00Z" 
  },
];

// Admins & Users
export const MOCK_USERS: User[] = [
  {
    id: "admin-1",
    name: "مدیر ارشد سیستم",
    username: "admin",
    mobile: "09121111111",
    role: UserRole.SuperAdmin,
    avatar: "https://i.pravatar.cc/150?u=admin",
    ttshahr: { isRegistered: true, lastCheckedAt: "2024-01-01T10:00:00Z" },
    createdAt: "2023-01-01T10:00:00Z"
  },
  {
    id: "finance-1",
    name: "کارشناس مالی",
    username: "finance",
    mobile: "09122222222",
    role: UserRole.FinanceAdmin,
    ttshahr: { isRegistered: true, lastCheckedAt: "2024-01-01T10:00:00Z" },
    createdAt: "2023-02-01T10:00:00Z"
  },
  {
    id: "senior-1",
    name: "سرپرست اداری",
    username: "senior",
    mobile: "09123333333",
    role: UserRole.SeniorAdmin,
    ttshahr: { isRegistered: true, lastCheckedAt: "2024-01-01T10:00:00Z" },
    createdAt: "2023-03-01T10:00:00Z"
  },
  {
    id: "agent-1",
    name: "کارشناس اداری",
    username: "agent",
    mobile: "09124444444",
    role: UserRole.Admin,
    ttshahr: { isRegistered: true, lastCheckedAt: "2024-01-01T10:00:00Z" },
    createdAt: "2023-04-01T10:00:00Z"
  },
  {
    id: "user-1",
    name: "رضا محمدی",
    username: "09123456789",
    mobile: "09123456789",
    nationalId: "0012345678",
    role: UserRole.Borrower,
    ttshahr: { isRegistered: true, lastCheckedAt: "2024-05-10T10:00:00Z" },
    createdAt: "2024-05-10T09:00:00Z"
  },
  {
    id: "user-2",
    name: "سارا احمدی",
    username: "09351234567",
    mobile: "09351234567",
    nationalId: "1234567890",
    role: UserRole.Borrower,
    ttshahr: { isRegistered: false, lastCheckedAt: "2024-05-08T09:00:00Z" },
    createdAt: "2024-05-08T08:00:00Z"
  }
];

export const MOCK_REQUESTS: LoanRequest[] = [
  {
    id: "req-1",
    userId: "user-1",
    requestNumber: "TRN-1403-001",
    fullName: "رضا محمدی",
    mobile: "09123456789",
    nationalId: "0012345678",
    amountToman: 50000000,
    tenorMonths: 12,
    branch: MOCK_BRANCHES[0],
    status: LoanRequestStatus.WaitingForLetter,
    ttshahrStatus: true,
    createdAt: "2024-05-10T10:00:00Z",
    updatedAt: "2024-05-11T12:00:00Z",
    shahkar: { status: "ok", checkedAt: "2024-05-10T10:05:00Z" },
    history: [
      { status: LoanRequestStatus.Submitted, changedBy: "System", changedAt: "2024-05-10T10:00:00Z" },
      { status: LoanRequestStatus.IdentityCheck, changedBy: "System", changedAt: "2024-05-10T10:01:00Z" },
      { status: LoanRequestStatus.WaitingForLetter, changedBy: "System", changedAt: "2024-05-10T10:05:00Z" }
    ]
  },
  {
    id: "req-2",
    userId: "user-2",
    requestNumber: "TRN-1403-002",
    fullName: "سارا احمدی",
    mobile: "09351234567",
    nationalId: "1234567890",
    amountToman: 100000000,
    tenorMonths: 24,
    branch: MOCK_BRANCHES[1],
    status: LoanRequestStatus.WaitingForBankApproval,
    ttshahrStatus: false,
    createdAt: "2024-05-08T09:00:00Z",
    updatedAt: "2024-05-09T14:30:00Z",
    shahkar: { status: "ok", checkedAt: "2024-05-08T09:05:00Z" },
    letter: { fileId: "file-123", letterNumber: "LTR-9988", issuedAt: "2024-05-09T14:30:00Z", url: "#" },
    history: [
      { status: LoanRequestStatus.Submitted, changedBy: "System", changedAt: "2024-05-08T09:00:00Z" },
      { status: LoanRequestStatus.WaitingForLetter, changedBy: "System", changedAt: "2024-05-08T09:05:00Z" },
      { status: LoanRequestStatus.LetterIssued, changedBy: "Admin", changedAt: "2024-05-09T14:00:00Z" },
      { status: LoanRequestStatus.WaitingForBankApproval, changedBy: "User", changedAt: "2024-05-09T14:30:00Z" }
    ]
  }
];

export const MOCK_NOTES: Record<string, Note[]> = {
  "req-1": [
    { id: "n1", text: "مدارک هویتی کاربر تایید شد.", authorName: "کارشناس اداری", createdAt: "2024-05-10T10:02:00Z" }
  ],
  "user-1": [
    { id: "un1", text: "کاربر خوش‌حساب.", authorName: "مدیر ارشد", createdAt: "2024-01-10T10:02:00Z", priority: 'normal' }
  ]
};

export const MOCK_SMS_LOGS: Record<string, SmsLog[]> = {
  "req-2": [
    { id: "sms-1", type: "letter_issued", status: "sent", sentAt: "2024-05-09T14:05:00Z", mobile: "09351234567" }
  ]
};