import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { branchesApi } from '../services/api';
import { Branch, UserRole } from '../types';
import { useAuth } from '../App';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Search, Plus, Edit2, Power, Trash2, Building2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const BranchesListPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({ code: '', name: '', city: '', isActive: true });

  // Access Control
  if (user?.role !== UserRole.SuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const { data, isLoading } = useQuery({
    queryKey: ['branches-list', page, search],
    queryFn: () => branchesApi.getBranches({ page, pageSize: 10, search }),
    placeholderData: keepPreviousData
  });

  const createMutation = useMutation({
    mutationFn: branchesApi.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches-list'] });
      closeModal();
    },
    onError: (err: any) => setErrorMsg(err.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => branchesApi.updateBranch(editingBranch!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches-list'] });
      closeModal();
    },
    onError: (err: any) => setErrorMsg(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: branchesApi.deleteBranch,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches-list'] }),
    onError: (err: any) => alert(err.message)
  });

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormData({ code: '', name: '', city: '', isActive: true });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({ code: branch.code, name: branch.name, city: branch.city || '', isActive: branch.isActive });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      setErrorMsg("کد و نام شعبه الزامی است.");
      return;
    }
    if (editingBranch) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const toggleStatus = (branch: Branch) => {
     if(confirm(`آیا از ${branch.isActive ? 'غیرفعال' : 'فعال'} کردن شعبه ${branch.name} اطمینان دارید؟`)) {
        branchesApi.updateBranch(branch.id, { isActive: !branch.isActive })
          .then(() => queryClient.invalidateQueries({ queryKey: ['branches-list'] }));
     }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand" />
            مدیریت شعب
          </h2>
          <p className="text-sm text-gray-500">افزودن و ویرایش شعب بانک</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 me-2" />
          افزودن شعبه جدید
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
         <div className="relative max-w-md">
           <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
           <input 
             className="w-full pr-10 pl-3 py-2 border rounded-lg focus:ring-brand focus:border-brand"
             placeholder="جستجو (کد، نام، شهر)..."
             value={search}
             onChange={e => { setSearch(e.target.value); setPage(1); }}
           />
         </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-right text-gray-500">
          <thead className="bg-gray-50 text-gray-700">
             <tr>
               <th className="px-6 py-3">کد شعبه</th>
               <th className="px-6 py-3">نام شعبه</th>
               <th className="px-6 py-3">شهر</th>
               <th className="px-6 py-3">وضعیت</th>
               <th className="px-6 py-3">عملیات</th>
             </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="text-center py-8">در حال بارگذاری...</td></tr>}
            {data?.data.map(branch => (
              <tr key={branch.id} className={`border-t hover:bg-gray-50 transition-colors ${!branch.isActive ? 'bg-gray-50 opacity-75' : ''}`}>
                <td className="px-6 py-4 font-mono font-medium">{branch.code}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{branch.name}</td>
                <td className="px-6 py-4">{branch.city || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${branch.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                    {branch.isActive ? 'فعال' : 'غیرفعال'}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditModal(branch)} title="ویرایش">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus(branch)} title={branch.isActive ? "غیرفعال کردن" : "فعال کردن"}>
                    <Power className={`w-4 h-4 ${branch.isActive ? 'text-orange-500' : 'text-green-500'}`} />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => { if(confirm('حذف؟')) deleteMutation.mutate(branch.id); }} title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {!isLoading && data?.data.length === 0 && (
               <tr><td colSpan={5} className="text-center py-8 text-gray-400">شعبه‌ای یافت نشد.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <span className="text-sm text-gray-700">
            صفحه {page} از {Math.ceil((data?.total || 0) / 10)}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>قبلی</Button>
            <Button variant="outline" size="sm" disabled={!data || data.data.length < 10} onClick={() => setPage(p => p + 1)}>بعدی</Button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingBranch ? 'ویرایش شعبه' : 'افزودن شعبه جدید'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>انصراف</Button>
            <Button onClick={handleSubmit} isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingBranch ? 'ذخیره تغییرات' : 'افزودن شعبه'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
           {errorMsg && <div className="p-2 bg-red-50 text-red-600 text-sm rounded">{errorMsg}</div>}
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">کد شعبه *</label>
             <input 
               className="w-full border rounded-lg p-2 focus:ring-brand font-mono text-left" 
               value={formData.code}
               onChange={e => setFormData({...formData, code: e.target.value})}
               placeholder="مثلا 101"
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">نام شعبه *</label>
             <input 
               className="w-full border rounded-lg p-2 focus:ring-brand" 
               value={formData.name}
               onChange={e => setFormData({...formData, name: e.target.value})}
               placeholder="مثلا شعبه مرکزی"
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">شهر</label>
             <input 
               className="w-full border rounded-lg p-2 focus:ring-brand" 
               value={formData.city}
               onChange={e => setFormData({...formData, city: e.target.value})}
             />
           </div>
           
           <div className="flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="activeCheck"
                checked={formData.isActive}
                onChange={e => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 text-brand rounded focus:ring-brand"
              />
              <label htmlFor="activeCheck" className="text-sm text-gray-700 cursor-pointer">شعبه فعال است</label>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default BranchesListPage;