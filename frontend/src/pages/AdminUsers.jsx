import React, { useState, useEffect } from 'react';
import adminService from '../services/admin.service';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Input from '../components/Input';
import Notification from '../components/Notification';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'passenger'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Lỗi khi tải danh sách người dùng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser._id, { name: userForm.name, role: userForm.role });
        setNotification({ message: 'Cập nhật người dùng thành công!', type: 'success' });
      } else {
        await adminService.createUser(userForm);
        setNotification({ message: 'Tạo người dùng mới thành công!', type: 'success' });
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', role: 'passenger' });
      loadUsers();
    } catch (err) {
      setNotification({ message: err.response?.data?.message || 'Có lỗi xảy ra.', type: 'error' });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này?")) return;
    try {
      await adminService.deleteUser(userId);
      setNotification({ message: 'Đã xóa người dùng.', type: 'info' });
      loadUsers();
    } catch (err) {
      setNotification({ message: 'Lỗi khi xóa người dùng.', type: 'error' });
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({ name: user.name, email: user.email, role: user.role, password: '' });
    setShowUserModal(true);
  };

  if (loading && users.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-2xl">👥</div>
        <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu người dùng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mb-3 flex items-center gap-4">
            <span className="w-12 h-12 bg-blue-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30 not-italic uppercase">👥</span>
            QUẢN TRỊ NGƯỜI DÙNG
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] ml-2">Phân quyền Hệ thống Metro Intelligence</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100 italic font-black text-sm px-6" onClick={loadUsers}>
              LÀM MỚI ↻
           </Button>
           <Button variant="primary" className="shadow-lg shadow-blue-500/30 italic font-black text-sm px-6" onClick={() => { setEditingUser(null); setUserForm({name:'', email:'', password:'', role:'passenger'}); setShowUserModal(true); }}>
              THÊM USER +
           </Button>
        </div>
      </div>

      {error && <Alert type="error" className="mb-6 rounded-[2rem] shadow-xl">{error}</Alert>}

      <section className="premium-card overflow-hidden shadow-2xl shadow-slate-200/50 rounded-[3rem] border-blue-500/5 bg-white/95 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white italic">
                <th className="px-10 py-8 font-black uppercase text-[10px] tracking-[0.2em] w-1/3">Thông tin hồ sơ</th>
                <th className="px-10 py-8 font-black uppercase text-[10px] tracking-[0.2em] text-center">Vai trò</th>
                <th className="px-10 py-8 font-black uppercase text-[10px] tracking-[0.2em] text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-blue-50/40 transition-all duration-300 h-28 group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl transition-all group-hover:rotate-12 group-hover:scale-110 uppercase">
                        {u.name?.[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-xl italic tracking-tight text-slate-800 truncate lowercase first-letter:uppercase">{u.name}</p>
                        <p className="text-xs font-bold text-slate-400 italic tracking-widest truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest italic border-2 shadow-sm ${
                      u.role === 'admin' ? 'bg-indigo-900 border-indigo-900 text-white' :
                      u.role === 'staff' ? 'bg-blue-600 border-blue-600 text-white' :
                      u.role === 'inspector' ? 'bg-red-600 border-red-600 text-white' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button onClick={() => openEditUser(u)} variant="secondary" className="!p-3 rounded-xl hover:scale-110 transition-transform">✏️</Button>
                      <Button onClick={() => handleDeleteUser(u._id)} variant="danger" className="!p-3 rounded-xl hover:rotate-12 transition-transform shadow-lg shadow-red-500/20">🗑️</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
           <div className="bg-white rounded-[32px] p-10 max-w-md w-full shadow-2xl animate-pop-in">
              <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-8 tracking-tighter">
                {editingUser ? 'CẬP NHẬT USER' : 'THÊM NGƯỜI DÙNG MỚI'}
              </h3>
              <form onSubmit={handleUserSubmit} className="space-y-6">
                 <Input label="Họ và Tên" placeholder="VD: Nguyễn Văn A" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} required />
                 <Input label="Email" type="email" placeholder="email@example.com" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} disabled={!!editingUser} required />
                 {!editingUser && (
                   <Input label="Mật khẩu" type="password" placeholder="••••••••" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
                 )}
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 px-1">Vai trò hệ thống</label>
                    <select 
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-4 font-bold text-sm focus:ring-2 ring-blue-500 shadow-inner"
                      value={userForm.role}
                      onChange={e => setUserForm({...userForm, role: e.target.value})}
                    >
                      <option value="passenger">Hành khách (Passenger)</option>
                      <option value="staff">Nhân viên (Staff)</option>
                      <option value="inspector">Kiểm soát viên (Inspector)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={() => setShowUserModal(false)} variant="secondary" className="flex-1 !py-4 uppercase font-black italic tracking-widest text-[10px]">HỦY</Button>
                    <Button type="submit" variant="primary" className="flex-1 !py-4 uppercase font-black italic tracking-widest text-[10px]">XÁC NHẬN</Button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
