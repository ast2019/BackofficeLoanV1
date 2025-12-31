import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../services/api';
import { UserRole } from '../types';
import RoleBadge from '../components/ui/RoleBadge';
import TTShahrBadge from '../components/ui/TTShahrBadge';
import Button from '../components/ui/Button';
import NotesPanel from '../components/ui/NotesPanel';
import Modal from '../components/ui/Modal';
import { useAuth } from '../App';
import { ArrowRight, RefreshCw, UserCog } from 'lucide-react';

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Borrower);

  const canChangeRole = currentUser?.role === UserRole.SuperAdmin;

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUserById(id!),
    enabled: !!id
  });

  const { data: notes } = useQuery({
    queryKey: ['user-notes', id],
    queryFn: () => usersApi.getUserNotes(id!),
    enabled: !!id
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

  if (isLoading) return <div className="p-10">Loading...</div>;
  if (!user) return <div className="p-10">User not found</div>;

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
                     {user.avatar ? <img src={user.avatar} className="w-16 h-16 rounded-full" /> : <div className="w-16 h-16 bg-gray-200 rounded-full" />}
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
              <div><span className="text-gray-500 block">نام کاربری</span>{user.username}</div>
              <div><span className="text-gray-500 block">کد ملی</span>{user.nationalId || '-'}</div>
              <div><span className="text-gray-500 block">تاریخ عضویت</span>{new Date(user.createdAt).toLocaleDateString('fa-IR')}</div>
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