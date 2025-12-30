export enum LoanRequestStatus {
  Submitted = "Submitted",
  IdentityCheck = "IdentityCheck",
  RejectedByShahkar = "RejectedByShahkar",
  WaitingForLetter = "WaitingForLetter",
  LetterIssued = "LetterIssued",
  WaitingForBankApproval = "WaitingForBankApproval",
  LoanPaid = "LoanPaid",
  Closed = "Closed"
}

export enum UserRole {
  SuperAdmin = "SuperAdmin",
  SupportAgent = "SupportAgent",
  ReadOnly = "ReadOnly"
}

export interface Branch {
  code: string;
  name: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  avatar?: string;
}

export interface BankResult {
  approved: boolean;
  paidAmountToman?: number;
  tenorMonths?: number;
  paidAt?: string;
  reason?: string;
}

export interface LetterInfo {
  fileId: string;
  letterNumber: string;
  issuedAt: string;
}

export interface ShahkarResult {
  status: "ok" | "fail" | "unavailable";
  checkedAt: string;
}

export interface LoanRequest {
  id: string;
  requestNumber: string;
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
  history: Array<{
    status: LoanRequestStatus;
    changedBy: string;
    changedAt: string;
    note?: string;
  }>;
}

export interface RequestsFilter {
  status?: LoanRequestStatus[];
  search?: string; // mobile, nationalId, requestNumber
  branchCode?: string;
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}