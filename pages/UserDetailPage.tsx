import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, requestsApi } from '../services/api';
import { UserRole } from '../types';
import RoleBadge from '../components/ui/RoleBadge';
import TTShahrBadge from '../components/ui/TTShahrBadge';
import Button from '../components/ui/Button';
import NotesPanel from '../components/ui/NotesPanel';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../App';
import { ArrowRight, RefreshCw, UserCog, Eye } from 'lucide-react';

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Borrower);

  const canChangeRole = currentUser?.role === UserRole.SuperAdmin;

  // 1. Get User Info
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUserById(id!),
    enabled: !!id
  });

  // 2. Get User Notes
  const { data: notes } = useQuery({
    queryKey: ['user-notes', id],
    queryFn: () => usersApi.getUserNotes(id!),
    enabled: !!id
  });

  // 3. Get User Requests (History)
  // We use the search filter with mobile as a workaround since the mock API is simple
  const { data: userRequests } = useQuery({
    queryKey: ['user-requests', user?.mobile],
    queryFn: () => requestsApi.getRequests({ page: 1, pageSize: 50, search: user?.mobile }),
    enabled: !!user?.mobile
  });

  const refreshTTShahrMutation = useMutation({
    mutationFn: () => usersApi.refreshTTShahr(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user', id] })
  });

  const changeRoleMutation = useMutation({
    mutationFn: () => usersApi.changeRole(id!, selectedRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      setRoleModalOpen(false);
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: (text: string) => usersApi.createUserNote(id!, text, currentUser?.name || 'Admin'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-notes', id] })
  });

  if (isUserLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!user) return <div className="p-10 text-center text-red-500">User not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">پروفایل {user.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
             <div className="flex items-start justify-between">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                     {user.avatar ? <img src={user.avatar} className="w-16 h-16 rounded-full" alt="avatar" /> : <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl">{user.name.charAt(0)}</div>}
                     <div>
                       <h3 className="font-bold text-lg">{user.name}</h3>
                       <p className="text-gray-500">{user.mobile}</p>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <RoleBadge role={user.role} />
                     <TTShahrBadge isRegistered={user.ttshahr.isRegistered} lastCheckedAt={user.ttshahr.lastCheckedAt} />
                   </div>
                </div>
                {canChangeRole && (
                  <Button variant="outline" size="sm" onClick={() => { setSelectedRole(user.role); setRoleModalOpen(true); }}>
                    <UserCog className="w-4 h-4 me-2" />
                    تغییر نقش
                  </Button>
                )}
             </div>
             
             <div className="mt-6 pt-6 border-t border-gray-100 flex gap-4">
                <Button variant="ghost" size="sm" onClick={() => refreshTTShahrMutation.mutate()} isLoading={refreshTTShahrMutation.isPending}>
                  <RefreshCw className="w-4 h-4 me-2" />
                  بروزرسانی وضعیت تی‌تی‌شهر
                </Button>
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">اطلاعات هویتی</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500 block mb-1">نام کاربری</span><span className="font-medium">{user.username}</span></div>
              <div><span className="text-gray-500 block mb-1">کد ملی</span><span className="font-medium">{user.nationalId || '-'}</span></div>
              <div><span className="text-gray-500 block mb-1">تاریخ عضویت</span><span className="font-medium dir-ltr">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</span></div>
            </div>
          </div>

          {/* User Requests List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100">
               <h3 className="font-bold text-gray-900">درخواست‌های کاربر</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-right text-gray-500">
                 <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-6 py-3">شماره</th>
                      <th className="px-6 py-3">مبلغ</th>
                      <th className="px-6 py-3">وضعیت</th>
                      <th className="px-6 py-3">تاریخ</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                 </thead>
                 <tbody>
                   {userRequests?.data && userRequests.data.length > 0 ? userRequests.data.map(req => (
                     <tr key={req.id} className="border-t hover:bg-gray-50">
                       <td className="px-6 py-4 font-medium">{req.requestNumber}</td>
                       <td className="px-6 py-4">{req.amountToman.toLocaleString()}</td>
                       <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                       <td className="px-6 py-4 dir-ltr text-right">{new Date(req.createdAt).toLocaleDateString('fa-IR')}</td>
                       <td className="px-6 py-4">
                         <Link to={`/admin/requests/${req.id}`} className="text-brand hover:underline flex items-center">
                           <Eye className="w-4 h-4 me-1" />
                           مشاهده
                         </Link>
                       </td>
                     </tr>
                   )) : (
                     <tr>
                       <td colSpan={5} className="text-center py-6 text-gray-400">هیچ درخواستی برای این کاربر یافت نشد.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        <div>
           <NotesPanel 
             title="یادداشت‌های کاربر"
             notes={notes || []} 
             onAddNote={(text) => addNoteMutation.mutate(text)}
             isLoading={addNoteMutation.isPending}
           />
        </div>
      </div>

      <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="تغییر نقش کاربر">
        <div className="space-y-4">
           <p className="text-sm text-gray-600">نقش جدید را برای <strong>{user.name}</strong> انتخاب کنید. این تغییر بلافاصله اعمال می‌شود.</p>
           <select className="w-full border p-2 rounded" value={selectedRole} onChange={e => setSelectedRole(e.target.value as UserRole)}>
             {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
           </select>
           <div className="flex justify-end gap-2 pt-2">
             <Button variant="ghost" onClick={() => setRoleModalOpen(false)}>لغو</Button>
             <Button onClick={() => changeRoleMutation.mutate()}>تایید تغییر</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetailPage;