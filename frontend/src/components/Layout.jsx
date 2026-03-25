import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Notification from './Notification';
import { socket } from '../socket';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNotifications, setActiveNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (user && ['staff', 'admin', 'inspector'].includes(user.role)) {
      socket.connect();
      
      socket.on('metro.incidentReported', (incident) => {
        setActiveNotifications(prev => [{
          id: Date.now() + Math.random(),
          message: `🚨 KHẨN CẤP: ${incident.type} tại ${incident.location}`,
          type: 'error'
        }, ...prev]);
      });

      socket.on('metro.incidentResolved', (incident) => {
        setActiveNotifications(prev => [{
          id: Date.now() + Math.random(),
          message: `✅ ĐÃ GIẢI QUYẾT: Sự cố tại ${incident.location} đã được xử lý.`,
          type: 'success'
        }, ...prev]);
      });
    }

    return () => {
      socket.off('metro.incidentReported');
      socket.off('metro.incidentResolved');
      socket.disconnect();
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Trang chủ', path: '/', roles: ['passenger', 'staff', 'inspector', 'admin'], icon: '🏠' },
    { label: 'Lộ trình', path: '/metro-map', roles: ['passenger', 'staff', 'inspector', 'admin'], icon: '🗺️' },
    { label: 'Mua vé', path: '/purchase', roles: ['passenger'], icon: '🎫' },
    { label: 'Vé của tôi', path: '/my-tickets', roles: ['passenger'], icon: '📇' },
    { label: 'Nạp tiền', path: '/topup', roles: ['passenger'], icon: '💰' },
    { label: 'Soát vé', path: '/validate', roles: ['staff', 'admin'], icon: '🚥' },
    { label: 'Lịch sử soát vé', path: '/validation-history', roles: ['staff', 'admin'], icon: '📊' },
    { label: 'Báo cáo sự cố', path: '/report-incident', roles: ['staff', 'inspector', 'admin'], icon: '⚠️' },
    { label: 'Kiểm tra thủ công', path: '/manual-inspection', roles: ['inspector', 'admin'], icon: '🔍' },
    { label: 'Lập biên bản', path: '/violations', roles: ['inspector', 'admin'], icon: '✍️' },
    { label: 'Lịch sử đi tuần', path: '/inspection-history', roles: ['inspector', 'admin'], icon: '📅' },
    { label: 'Quản lý người dùng', path: '/admin/users', roles: ['admin'], icon: '👥' },
    { label: 'Quản lý trạm/tuyến', path: '/admin/metro', roles: ['admin'], icon: '🚇' },
    { label: 'Thống kê', path: '/admin/reports', roles: ['admin'], icon: '📈' },
    { label: 'Bảo mật tài khoản', path: '/security', roles: ['passenger', 'staff', 'inspector', 'admin'], icon: '🛡️' },
    { label: 'Hồ sơ cá nhân', path: '/profile', roles: ['passenger', 'staff', 'inspector', 'admin'], icon: '👤' },
  ];

  const filteredItems = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col text-slate-900 shadow-2xl transition-all duration-300 border-r border-slate-100 dark:border-slate-800" style={{ backgroundColor: 'var(--sidebar)', borderColor: 'var(--border)' }}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-2xl animate-pulse shadow-xl shadow-blue-500/20 rotate-12">🚇</div>
            <h1 className="text-2xl font-black tracking-tight italic bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase">METRONET</h1>
          </div>

          <nav className="space-y-2">
            {filteredItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group font-black italic text-xs uppercase tracking-widest ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600'
                  }`
                }
              >
                <span className="text-xl group-hover:scale-125 transition-transform duration-200 not-italic">{item.icon}</span>
                <span className="">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100 dark:border-slate-800">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-6 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 transition-all group"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner uppercase text-white group-hover:scale-110 transition-transform">
              {user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate text-sm text-slate-800 dark:text-slate-200">{user?.name}</p>
              <p className="text-[10px] text-blue-500 truncate uppercase tracking-widest font-black">Sửa hồ sơ ✏️</p>
            </div>
          </div>
          <Button 
            variant="danger" 
            className="w-full justify-center gap-3 !py-3 rounded-xl font-black italic uppercase text-[10px] tracking-widest"
            onClick={handleLogout}
          >
            <span>🚪</span> Đăng xuất
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-20 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm backdrop-blur-md border-b dark:border-slate-800" style={{ background: 'rgba(var(--bg-rgb), 0.8)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black italic uppercase tracking-tighter text-slate-800 dark:text-slate-100 hidden md:block">Metro Control Panel 🛡️</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:scale-110 transition-all shadow-sm border border-slate-100 dark:border-slate-700"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <span className="text-[9px] text-blue-600 font-bold uppercase animate-pulse">System Live ✔</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm border border-slate-100 dark:border-slate-700"
              >
                🔔
                {activeNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold border border-white animate-bounce">
                    {activeNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-[24px] shadow-2xl border border-slate-100 dark:border-slate-700 py-6 z-[100] animate-pop-in">
                   <div className="px-6 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center">
                      <h4 className="text-xs font-black italic uppercase tracking-widest text-slate-900 dark:text-white">Thông báo</h4>
                      <button onClick={() => setActiveNotifications([])} className="text-[9px] font-bold text-blue-600 hover:underline">Xóa hết</button>
                   </div>
                   <div className="max-h-72 overflow-y-auto">
                      {activeNotifications.length > 0 ? (
                        activeNotifications.map(n => (
                          <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-relaxed mb-1">{n.message}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Vừa xong</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 text-center">
                           <div className="text-3xl mb-2 opacity-30">📭</div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Không có thông báo mới</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="p-8 flex-1 overflow-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </section>

        {/* Global Realtime Notifications Floating */}
        <div className="fixed bottom-0 right-0 p-6 flex flex-col gap-3 z-[100] max-w-md w-full">
           {activeNotifications.map(n => (
              <Notification 
                key={n.id} 
                message={n.message} 
                type={n.type} 
                duration={8000}
                onClose={() => setActiveNotifications(prev => prev.filter(item => item.id !== n.id))}
              />
           ))}
        </div>
      </main>
    </div>
  );
};

export default Layout;
