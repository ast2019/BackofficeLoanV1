import { LoanRequest, LoanRequestStatus, UserRole, AdminUser, Branch } from '../types';

export const MOCK_BRANCHES: Branch[] = [
  { code: "101", name: "شعبه مرکزی" },
  { code: "102", name: "شعبه شمال تهران" },
  { code: "103", name: "شعبه بازار" },
  { code: "201", name: "شعبه اصفهان" },
  { code: "301", name: "شعبه مشهد" },
];

export const MOCK_ADMIN: AdminUser = {
  id: "admin-1",
  name: "علی مدیر",
  username: "admin",
  role: UserRole.SuperAdmin,
  avatar: "https://picsum.photos/100/100"
};

export const MOCK_REQUESTS: LoanRequest[] = [
  {
    id: "req-1",
    requestNumber: "TRN-1403-001",
    fullName: "رضا محمدی",
    mobile: "09123456789",
    nationalId: "0012345678",
    amountToman: 50000000,
    tenorMonths: 12,
    branch: MOCK_BRANCHES[0],
    status: LoanRequestStatus.WaitingForLetter,
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
    requestNumber: "TRN-1403-002",
    fullName: "سارا احمدی",
    mobile: "09351234567",
    nationalId: "1234567890",
    amountToman: 100000000,
    tenorMonths: 24,
    branch: MOCK_BRANCHES[1],
    status: LoanRequestStatus.WaitingForBankApproval,
    createdAt: "2024-05-08T09:00:00Z",
    updatedAt: "2024-05-09T14:30:00Z",
    shahkar: { status: "ok", checkedAt: "2024-05-08T09:05:00Z" },
    letter: { fileId: "file-123", letterNumber: "LTR-9988", issuedAt: "2024-05-09T14:30:00Z" },
    history: [
      { status: LoanRequestStatus.Submitted, changedBy: "System", changedAt: "2024-05-08T09:00:00Z" },
      { status: LoanRequestStatus.WaitingForLetter, changedBy: "System", changedAt: "2024-05-08T09:05:00Z" },
      { status: LoanRequestStatus.LetterIssued, changedBy: "Admin", changedAt: "2024-05-09T14:00:00Z" },
      { status: LoanRequestStatus.WaitingForBankApproval, changedBy: "User", changedAt: "2024-05-09T14:30:00Z" }
    ]
  },
  {
    id: "req-3",
    requestNumber: "TRN-1403-003",
    fullName: "امیر حسینی",
    mobile: "09199876543",
    nationalId: "0055667788",
    amountToman: 30000000,
    tenorMonths: 6,
    branch: MOCK_BRANCHES[2],
    status: LoanRequestStatus.LoanPaid,
    createdAt: "2024-05-01T08:00:00Z",
    updatedAt: "2024-05-05T10:00:00Z",
    shahkar: { status: "ok", checkedAt: "2024-05-01T08:05:00Z" },
    letter: { fileId: "file-124", letterNumber: "LTR-7766", issuedAt: "2024-05-02T10:00:00Z" },
    bankResult: { approved: true, paidAmountToman: 30000000, tenorMonths: 6, paidAt: "2024-05-05T10:00:00Z" },
    history: [
      { status: LoanRequestStatus.Submitted, changedBy: "System", changedAt: "2024-05-01T08:00:00Z" },
      { status: LoanRequestStatus.LoanPaid, changedBy: "Bank", changedAt: "2024-05-05T10:00:00Z" }
    ]
  },
   {
    id: "req-4",
    requestNumber: "TRN-1403-004",
    fullName: "نگار کریمی",
    mobile: "09010000001",
    nationalId: "3334445556",
    amountToman: 20000000,
    tenorMonths: 12,
    branch: MOCK_BRANCHES[0],
    status: LoanRequestStatus.RejectedByShahkar,
    createdAt: "2024-05-12T11:00:00Z",
    updatedAt: "2024-05-12T11:05:00Z",
    shahkar: { status: "fail", checkedAt: "2024-05-12T11:05:00Z" },
    history: [
      { status: LoanRequestStatus.Submitted, changedBy: "System", changedAt: "2024-05-12T11:00:00Z" },
      { status: LoanRequestStatus.RejectedByShahkar, changedBy: "System", changedAt: "2024-05-12T11:05:00Z" }
    ]
  }
];