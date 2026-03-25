import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Notification from '../components/Notification';

const roleLabels = {
  admin: { label: 'Quản trị viên', color: 'bg-red-100 text-red-700', icon: '👑' },
  staff: { label: 'Nhân viên cổng soát', color: 'bg-blue-100 text-blue-700', icon: '🎫' },
  inspector: { label: 'Kiểm soát viên', color: 'bg-purple-100 text-purple-700', icon: '🔍' },
  passenger: { label: 'Hành khách', color: 'bg-green-100 text-green-700', icon: '🚇' },
};

const Profile = () => {
  const { user, updateMe } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const roleInfo = roleLabels[user?.role] || { label: user?.role, color: 'bg-slate-100 text-slate-700', icon: '👤' };
  const avatarLetter = (user?.name || 'U').charAt(0).toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Tên không được để trống.');
    if (name.trim() === user.name) { setEditing(false); return; }
    try {
      setLoading(true);
      setError(null);
      await updateMe(name.trim());
      setNotification({ message: 'Cập nhật tên thành công! 🎉', type: 'success' });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setError(null);
    setEditing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mb-2 uppercase">
          Hồ Sơ Cá Nhân
        </h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">
          Thông tin tài khoản • Chỉnh sửa hồ sơ
        </p>
      </div>

      {/* Avatar + Info Card */}
      <div className="premium-card p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* Avatar */}
        <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-4xl font-black italic text-white shadow-2xl flex-shrink-0 select-none">
          {avatarLetter}
        </div>

        {/* Info */}
        <div className="flex-1 w-full">
          {!editing ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Tên hiển thị</p>
                <p className="text-3xl font-black italic tracking-tighter text-slate-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Email</p>
                <p className="text-sm font-bold text-slate-600">{user?.email}</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest ${roleInfo.color}`}>
                  <span>{roleInfo.icon}</span>
                  {roleInfo.label}
                </span>
              </div>
              <Button
                variant="secondary"
                className="!px-6 !py-3 font-black italic mt-2"
                onClick={() => setEditing(true)}
              >
                ✏️ Chỉnh sửa tên
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
                  Tên mới của bạn
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-5 font-bold text-slate-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Nhập tên hiển thị mới..."
                  maxLength={60}
                />
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="!px-8 !py-3 font-black italic shadow-xl shadow-blue-500/20"
                  loading={loading}
                >
                  LƯU THAY ĐỔI ✅
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="!px-6 !py-3 font-black italic"
                  onClick={handleCancel}
                >
                  Hủy
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account details card */}
      <div className="premium-card p-8 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Thông tin tài khoản</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mã tài khoản</p>
            <p className="font-black text-sm text-slate-600 font-mono truncate">{user?._id}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Số dư ví</p>
            <p className="font-black text-xl italic text-blue-600">{(user?.balance || 0).toLocaleString()}đ</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Vai trò</p>
            <p className="font-black text-sm text-slate-700 uppercase">{roleInfo.icon} {roleInfo.label}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Trạng thái</p>
            <p className="font-black text-sm text-green-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
              Đang hoạt động
            </p>
          </div>
        </div>
      </div>

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default Profile;
