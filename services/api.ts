import { 
  LoanRequest, 
  RequestsFilter, 
  UsersFilter,
  PaginatedResponse, 
  User, 
  LoanRequestStatus,
  UserRole,
  Note,
  SmsLog,
  AppConfig
} from '../types';
import { MOCK_REQUESTS, MOCK_USERS, MOCK_BRANCHES, MOCK_NOTES, MOCK_SMS_LOGS } from './mockData';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (username: string, password: string): Promise<{ user: User, token: string }> => {
    await delay(600);
    // Simple mock auth
    const found = MOCK_USERS.find(u => u.username === username);
    if (found && password === username) { // Mock password rule: same as username
       return { user: found, token: `mock_token_${found.role}_${Date.now()}` };
    }
    throw new Error("نام کاربری یا رمز عبور اشتباه است (از نام کاربری به عنوان رمز استفاده کنید)");
  },
  
  logout: async () => {
    await delay(200);
  },

  getMe: async (): Promise<User> => {
    await delay(300);
    // Default to superadmin if localstorage logic is simple in this demo
    // In real app, verify token
    return MOCK_USERS[0]; 
  }
};

export const configApi = {
  getConfig: async (): Promise<AppConfig> => {
    await delay(200);
    return { letterMode: 'manual' }; // Change to 'auto' to test auto mode
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
    // Mock random result
    return { isRegistered: Math.random() > 0.5, lastCheckedAt: new Date().toISOString() };
  },

  getUserNotes: async (id: string): Promise<Note[]> => {
    return requestsApi.getNotes(id); // Using same mock store
  },

  createUserNote: async (id: string, text: string, authorName: string) => {
    return requestsApi.createNote(id, text, authorName);
  }
};

export const branchesApi = {
  getAll: async () => {
    await delay(200);
    return MOCK_BRANCHES;
  }
};