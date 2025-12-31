import { 
  LoanRequest, 
  RequestsFilter, 
  UsersFilter,
  BranchesFilter,
  PaginatedResponse, 
  User, 
  LoanRequestStatus,
  UserRole,
  Note,
  SmsLog,
  AppConfig,
  Branch
} from '../types';
import { MOCK_REQUESTS, MOCK_USERS, MOCK_BRANCHES, MOCK_NOTES, MOCK_SMS_LOGS } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to simulate mutable database
let mutableBranches = [...MOCK_BRANCHES];

export const authApi = {
  login: async (username: string, password: string): Promise<{ user: User, token: string }> => {
    await delay(600);
    const found = MOCK_USERS.find(u => u.username === username);
    if (found && password === username) { 
       return { user: found, token: `mock_token_${found.role}_${Date.now()}` };
    }
    throw new Error("نام کاربری یا رمز عبور اشتباه است (از نام کاربری به عنوان رمز استفاده کنید)");
  },
  
  logout: async () => {
    await delay(200);
  },

  getMe: async (): Promise<User> => {
    await delay(300);
    return MOCK_USERS[0]; 
  }
};

export const configApi = {
  getConfig: async (): Promise<AppConfig> => {
    await delay(200);
    return { 
      letterMode: 'manual',
      creditScoringEnabled: false,
      returnedChequeCheckEnabled: false,
      aiAdvisorEnabled: false
    }; 
  }
};

export const requestsApi = {
  getRequests: async (filter: RequestsFilter): Promise<PaginatedResponse<LoanRequest>> => {
    await delay(500);
    let filtered = [...MOCK_REQUESTS];

    if (filter.status && filter.status.length > 0) filtered = filtered.filter(r => filter.status!.includes(r.status));
    if (filter.branchCode) filtered = filtered.filter(r => r.branch.code === filter.branchCode);
    if (filter.ttshahrRegistered !== undefined) filtered = filtered.filter(r => r.ttshahrStatus === filter.ttshahrRegistered);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(r => r.mobile.includes(q) || r.nationalId.includes(q) || r.requestNumber.toLowerCase().includes(q) || r.fullName.includes(q));
    }

    const total = filtered.length;
    const start = (filter.page - 1) * filter.pageSize;
    return { data: filtered.slice(start, start + filter.pageSize), total, page: filter.page, pageSize: filter.pageSize };
  },

  getRequestById: async (id: string): Promise<LoanRequest> => {
    await delay(300);
    const req = MOCK_REQUESTS.find(r => r.id === id);
    if (!req) throw new Error("Request not found");
    return req;
  },

  issueLetter: async (id: string, letterData: any) => {
    await delay(800);
    console.log(`Letter issued/uploaded for ${id}`, letterData);
    return { success: true };
  },

  recordBankResult: async (id: string, result: any) => {
    await delay(800);
    console.log(`Bank result for ${id}`, result);
    return { success: true };
  },

  closeRequest: async (id: string) => {
    await delay(500);
    console.log(`Request closed ${id}`);
    return { success: true };
  },
  
  retryShahkar: async (id: string) => {
    await delay(1000);
    return { success: true };
  },

  getNotes: async (id: string): Promise<Note[]> => {
    await delay(300);
    return MOCK_NOTES[id] || [];
  },

  createNote: async (id: string, text: string, authorName: string) => {
    await delay(400);
    const newNote: Note = { id: Date.now().toString(), text, authorName, createdAt: new Date().toISOString() };
    if (!MOCK_NOTES[id]) MOCK_NOTES[id] = [];
    MOCK_NOTES[id].unshift(newNote);
    return newNote;
  },

  getSmsLogs: async (id: string): Promise<SmsLog[]> => {
    await delay(300);
    return MOCK_SMS_LOGS[id] || [];
  },

  resendSms: async (id: string) => {
    await delay(1000);
    return { success: true };
  }
};

export const usersApi = {
  getUsers: async (filter: UsersFilter): Promise<PaginatedResponse<User>> => {
    await delay(500);
    let filtered = [...MOCK_USERS];

    if (filter.role) filtered = filtered.filter(u => u.role === filter.role);
    if (filter.ttshahrRegistered !== undefined) filtered = filtered.filter(u => u.ttshahr.isRegistered === filter.ttshahrRegistered);
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(u => u.mobile.includes(q) || u.name.includes(q) || u.nationalId?.includes(q));
    }

    const total = filtered.length;
    const start = (filter.page - 1) * filter.pageSize;
    return { data: filtered.slice(start, start + filter.pageSize), total, page: filter.page, pageSize: filter.pageSize };
  },

  getUserById: async (id: string): Promise<User> => {
    await delay(300);
    const u = MOCK_USERS.find(x => x.id === id);
    if (!u) throw new Error("User not found");
    return u;
  },

  changeRole: async (id: string, newRole: UserRole) => {
    await delay(600);
    console.log(`Changed role of ${id} to ${newRole}`);
    return { success: true };
  },

  refreshTTShahr: async (id: string) => {
    await delay(1200);
    return { isRegistered: Math.random() > 0.5, lastCheckedAt: new Date().toISOString() };
  },

  getUserNotes: async (id: string): Promise<Note[]> => {
    return requestsApi.getNotes(id); 
  },

  createUserNote: async (id: string, text: string, authorName: string) => {
    return requestsApi.createNote(id, text, authorName);
  }
};

export const branchesApi = {
  getAll: async () => {
    await delay(200);
    return mutableBranches.filter(b => b.isActive);
  },

  getBranches: async (filter: BranchesFilter): Promise<PaginatedResponse<Branch>> => {
    await delay(400);
    let filtered = [...mutableBranches];
    
    if (filter.isActive !== undefined) {
      filtered = filtered.filter(b => b.isActive === filter.isActive);
    }
    
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(q) || 
        b.code.includes(q) || 
        (b.city && b.city.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const start = (filter.page - 1) * filter.pageSize;
    return { data: filtered.slice(start, start + filter.pageSize), total, page: filter.page, pageSize: filter.pageSize };
  },

  createBranch: async (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>) => {
    await delay(500);
    if (mutableBranches.some(b => b.code === data.code)) {
      throw new Error("کد شعبه تکراری است");
    }
    const newBranch: Branch = {
      ...data,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mutableBranches.push(newBranch);
    return newBranch;
  },

  updateBranch: async (id: string, data: Partial<Branch>) => {
    await delay(500);
    const index = mutableBranches.findIndex(b => b.id === id);
    if (index === -1) throw new Error("Branch not found");
    
    if (data.code && mutableBranches.some(b => b.code === data.code && b.id !== id)) {
      throw new Error("کد شعبه تکراری است");
    }

    mutableBranches[index] = {
      ...mutableBranches[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return mutableBranches[index];
  },

  deleteBranch: async (id: string) => {
    await delay(500);
    // Soft delete/Disable logic mainly
    const branch = mutableBranches.find(b => b.id === id);
    if (!branch) throw new Error("Branch not found");

    // Mock check for usage
    const isUsed = MOCK_REQUESTS.some(r => r.branch.code === branch.code);
    if (isUsed) {
       throw new Error("این شعبه در درخواست‌های موجود استفاده شده و قابل حذف نیست. می‌توانید آن را غیرفعال کنید.");
    }
    
    mutableBranches = mutableBranches.filter(b => b.id !== id);
    return { success: true };
  }
};