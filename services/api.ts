import { 
  LoanRequest, 
  RequestsFilter, 
  PaginatedResponse, 
  AdminUser, 
  LoanRequestStatus,
  UserRole
} from '../types';
import { MOCK_REQUESTS, MOCK_ADMIN, MOCK_BRANCHES } from './mockData';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (username: string, password: string): Promise<{ user: AdminUser, token: string }> => {
    await delay(800);
    if (username === 'admin' && password === 'admin') {
      return { user: MOCK_ADMIN, token: "mock_token_" + Date.now() };
    }
    // Simulate support agent
    if (username === 'support' && password === 'support') {
      return { 
        user: { ...MOCK_ADMIN, id: 'support-1', role: UserRole.SupportAgent, name: "کارشناس پشتیبانی" }, 
        token: "mock_token_s_" + Date.now() 
      };
    }
    throw new Error("نام کاربری یا رمز عبور اشتباه است.");
  },
  
  logout: async () => {
    await delay(200);
  },

  getMe: async (): Promise<AdminUser> => {
    await delay(300);
    return MOCK_ADMIN; // Simply return default for demo
  }
};

export const requestsApi = {
  getRequests: async (filter: RequestsFilter): Promise<PaginatedResponse<LoanRequest>> => {
    await delay(600);
    
    let filtered = [...MOCK_REQUESTS];

    // Status Filter
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(r => filter.status!.includes(r.status));
    }

    // Branch Filter
    if (filter.branchCode) {
      filtered = filtered.filter(r => r.branch.code === filter.branchCode);
    }

    // Search (Mobile, National ID, Request Number)
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.mobile.includes(q) || 
        r.nationalId.includes(q) || 
        r.requestNumber.toLowerCase().includes(q) ||
        r.fullName.includes(q)
      );
    }

    // Pagination
    const total = filtered.length;
    const start = (filter.page - 1) * filter.pageSize;
    const data = filtered.slice(start, start + filter.pageSize);

    return {
      data,
      total,
      page: filter.page,
      pageSize: filter.pageSize
    };
  },

  getRequestById: async (id: string): Promise<LoanRequest> => {
    await delay(400);
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (!req) throw new Error("درخواست یافت نشد.");
    return req;
  },

  issueLetter: async (id: string, letterData: { letterNumber: string, date: string, file?: File }) => {
    await delay(1000);
    console.log(`Letter issued for ${id}`, letterData);
    // In real app: upload file, generate PDF, update DB
    return { success: true };
  },

  recordBankResult: async (id: string, result: { approved: boolean, amount?: number, paidAt?: string, reason?: string }) => {
    await delay(1000);
    console.log(`Bank result for ${id}`, result);
    return { success: true };
  },

  closeRequest: async (id: string) => {
    await delay(500);
    console.log(`Request closed ${id}`);
    return { success: true };
  },
  
  retryShahkar: async (id: string) => {
    await delay(1500);
    console.log(`Retrying shahkar for ${id}`);
    return { success: true };
  }
};

export const branchesApi = {
  getAll: async () => {
    await delay(300);
    return MOCK_BRANCHES;
  }
};