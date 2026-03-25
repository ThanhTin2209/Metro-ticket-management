import React, { useState } from 'react';
import Button from '../components/Button';
import Notification from '../components/Notification';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    require2FA: false,
    systemAlert: "Hệ thống đang hoạt động ổn định."
  });
  const [notification, setNotification] = useState(null);

  const handleSave = () => {
    setNotification({ message: 'Đã lưu cấu hình hệ thống!', type: 'success' });
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
      <div>
        <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mb-2 uppercase">CÀI ĐẶT HỆ THỐNG</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] ml-2">Cấu hình vận hành • Bảo mật • Thông báo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Maintenance Mode */}
        <div className={`premium-card p-10 transition-all duration-500 border-b-8 ${settings.maintenanceMode ? 'bg-red-50 border-red-600' : 'bg-white border-blue-600'}`}>
           <div className="flex justify-between items-start mb-8">
              <div className="text-4xl">🚧</div>
              <div 
                onClick={() => toggleSetting('maintenanceMode')}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
           </div>
           <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800 mb-2">Chế độ Bảo trì</h3>
           <p className="text-xs text-slate-500 font-medium leading-relaxed">
             Khi bật, toàn bộ hệ thống (trừ Admin) sẽ tạm ngưng hoạt động để bảo trì kỹ thuật.
           </p>
        </div>

        {/* User Registration */}
        <div className="premium-card p-10 bg-white border-b-8 border-indigo-600">
           <div className="flex justify-between items-start mb-8">
              <div className="text-4xl">👥</div>
              <div 
                onClick={() => toggleSetting('allowRegistration')}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${settings.allowRegistration ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.allowRegistration ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
           </div>
           <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800 mb-2">Đăng ký mới</h3>
           <p className="text-xs text-slate-500 font-medium leading-relaxed">
             Cho phép hoặc tạm dừng việc đăng ký tài khoản hành khách mới trên ứng dụng.
           </p>
        </div>

        {/* Global Alert */}
        <div className="premium-card p-10 bg-white border-b-8 border-amber-500 md:col-span-2">
           <div className="flex items-center gap-4 mb-6">
              <div className="text-4xl">📢</div>
              <h3 className="text-xl font-black italic uppercase tracking-tight text-slate-800">Thông báo toàn hệ thống</h3>
           </div>
           <textarea 
             className="w-full h-24 bg-slate-50 rounded-2xl p-4 font-bold text-sm border-none focus:ring-2 ring-amber-500 transition-all"
             value={settings.systemAlert}
             onChange={e => setSettings({...settings, systemAlert: e.target.value})}
             placeholder="Nhập nội dung thông báo..."
           />
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 italic">
             * Thông báo này sẽ hiển thị trên dashboard của toàn bộ người dùng.
           </p>
        </div>
      </div>

      <div className="flex justify-end pt-8">
         <Button onClick={handleSave} variant="primary" className="!px-12 !py-4 font-black italic tracking-widest uppercase shadow-xl shadow-blue-500/20">
           LƯU TOÀN BỘ CẤU HÌNH
         </Button>
      </div>

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default AdminSettings;
