export enum UserRole {
  SuperAdmin = "super_admin",
  FinanceAdmin = "finance_admin",
  SeniorAdmin = "senior_admin",
  Admin = "admin",
  Borrower = "borrower"
}

export enum LoanRequestStatus {
  Submitted = "Submitted",
  IdentityCheck = "IdentityCheck",
  RejectedByShahkar = "RejectedByShahkar",
  WaitingForLetter = "WaitingForLetter",
  LetterIssued = "LetterIssued",
  WaitingForBankApproval = "WaitingForBankApproval",
  LoanPaid = "LoanPaid",
  Closed = "Closed",
  BankRejected = "BankRejected"
}

export interface Branch {
  code: string;
  name: string;
}

export interface TTShahrStatus {
  isRegistered: boolean;
  lastCheckedAt: string;
}

export interface Note {
  id: string;
  text: string;
  authorName: string;
  createdAt: string;
  priority?: 'normal' | 'high';
}

export interface SmsLog {
  id: string;
  type: 'letter_issued' | 'loan_paid' | 'manual';
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  mobile: string;
  message?: string;
  errorMessage?: string;
}

export interface User {
  id: string;
  name: string;
  username: string; // usually mobile
  mobile: string;
  nationalId?: string;
  role: UserRole;
  avatar?: string;
  ttshahr: TTShahrStatus;
  createdAt: string;
}

export interface BankResult {
  approved: boolean;
  paidAmountToman?: number;
  tenorMonths?: number;
  paidAt?: string;
  reason?: string;
  referenceNo?: string;
}

export interface LetterInfo {
  fileId: string;
  letterNumber: string;
  issuedAt: string;
  url?: string;
}

export interface ShahkarResult {
  status: "ok" | "fail" | "unavailable";
  checkedAt: string;
}

export interface LoanRequest {
  id: string;
  requestNumber: string;
  userId: string; // Link to User
  mobile: string;
  nationalId: string;
  fullName: string;
  amountToman: number;
  tenorMonths: number;
  branch: Branch;
  status: LoanRequestStatus;
  shahkar?: ShahkarResult;
  letter?: LetterInfo;
  bankResult?: BankResult;
  createdAt: string;
  updatedAt: string;
  ttshahrStatus: boolean; // Snapshot of registration at request time or synced
  history: Array<{
    status: LoanRequestStatus;
    changedBy: string;
    changedAt: string;
    note?: string;
  }>;
}

export interface RequestsFilter {
  status?: LoanRequestStatus[];
  search?: string;
  branchCode?: string;
  ttshahrRegistered?: boolean;
  page: number;
  pageSize: number;
}

export interface UsersFilter {
  search?: string;
  role?: UserRole;
  ttshahrRegistered?: boolean;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AppConfig {
  letterMode: 'auto' | 'manual';
}