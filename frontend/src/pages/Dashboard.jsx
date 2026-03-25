import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import metroService from '../services/metro.service';
import adminService from '../services/admin.service';

const Dashboard = () => {
  const { user, getMe } = useAuth();
  const [stats, setStats] = useState({ tickets: 0, transactions: [] });
  const [adminStats, setAdminStats] = useState({ revenue: 0, userCount: 0, ticketCount: 0, incidentCount: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'passenger') {
      loadPassengerData();
    } else if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadPassengerData = async () => {
    try {
      setLoading(true);
      const [tickets, transactions] = await Promise.all([
        metroService.getMyTickets(),
        metroService.getTransactions()
      ]);
      setStats({ 
        tickets: tickets.length, 
        transactions: transactions.slice(0, 5) 
      });
      await getMe();
    } catch (err) {
      console.error('Error loading passenger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setAdminStats(data);
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = {
    passenger: {
      title: 'Khu vực Hành Khách',
      description: 'Chào mừng bạn đến với hệ thống Metro. Tại đây bạn có thể mua vé, nạp tiền và quản lý lịch trình của mình.',
      actions: [
        { label: 'Mua vé ngay', path: '/purchase', icon: '🎫', color: 'bg-blue-500' },
        { label: 'Vé của tôi', path: '/my-tickets', icon: '📇', color: 'bg-indigo-500' },
        { label: 'Nạp tiền', path: '/topup', icon: '💰', color: 'bg-green-500' },
        { label: 'Lịch sử giao dịch', path: '/transactions', icon: '📜', color: 'bg-slate-500' },
      ],
      stats: [
        { label: 'Số dư ví', value: `${(user?.balance || 0).toLocaleString()}đ`, icon: '💳' },
        { label: 'Vé của tôi', value: stats.tickets.toString(), icon: '✅' },
        { label: 'Hoạt động', value: stats.transactions.length.toString(), icon: '⚡' },
      ]
    },
    staff: {
      title: 'Khu vực Nhân Viên Cổng Soát',
      description: 'Hỗ trợ hành khách và kiểm soát vé tại cổng. Vui lòng đảm bảo các quy định an toàn.',
      actions: [
        { label: 'Soát vé (Validate)', path: '/validate', icon: '🚥', color: 'bg-blue-600' },
        { label: 'Lịch sử soát vé', path: '/validation-history', icon: '📊', color: 'bg-indigo-600' },
        { label: 'Báo cáo sự cố', path: '/report-incident', icon: '⚠️', color: 'bg-red-50' },
      ],
      stats: [
        { label: 'Số vé đã soát (hôm nay)', value: '156', icon: '🎫' },
        { label: 'Cổng đang hoạt động', value: '12', icon: '⚙️' },
        { label: 'Sự cố cần báo cáo', value: '!', icon: '🔕' },
      ]
    },
    inspector: {
      title: 'Khu vực Kiểm Soát Viên',
      description: 'Kiểm tra đột xuất và xử lý vi phạm trên các tuyến tàu. Giữ gìn trật tự và kỷ luật.',
      actions: [
        { label: 'Kiểm tra thủ công', path: '/manual-inspection', icon: '🔍', color: 'bg-blue-700' },
        { label: 'Lập biên bản', path: '/violations', icon: '📝', color: 'bg-red-50' },
        { label: 'Lịch sử đi tuần', path: '/inspection-history', icon: '📅', color: 'bg-slate-700' },
      ],
      stats: [
        { label: 'Tổng lượt kiểm tra', value: '42', icon: '🔎' },
        { label: 'Biên bản đã lập', value: '03', icon: '🧾' },
        { label: 'Tỷ lệ tuân thủ', value: '98.5%', icon: '🛡️' },
      ]
    },
    admin: {
      title: 'Trang chủ Quản trị Hệ thống',
      description: 'Quản lý toàn bộ hạ tầng, nhân lực và doanh thu của mạng lưới Metronet.',
      actions: [
        { label: 'Quản lý người dùng', path: '/admin/users', icon: '👥', color: 'bg-blue-600' },
        { label: 'Quản lý Trạm & Tuyến', path: '/admin/metro', icon: '🚇', color: 'bg-indigo-600' },
        { label: 'Báo cáo hệ thống', path: '/admin/reports', icon: '📈', color: 'bg-green-600' },
        { label: 'Báo cáo sự cố', path: '/report-incident', icon: '⚠️', color: 'bg-slate-700' },
      ],
      stats: [
        { label: 'Doanh thu hôm nay', value: `${adminStats.revenue.toLocaleString()}đ`, icon: '💵' },
        { label: 'Hành khách hệ thống', value: adminStats.userCount.toString(), icon: '🚶' },
        { label: 'Sự cố đang mở', value: adminStats.incidentCount.toString(), icon: '🚨' },
      ]
    }
  };

  const config = roleConfigs[user?.role || 'passenger'];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-700 to-indigo-900 p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48 transition-transform hover:scale-110 duration-1000"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Xin chào, <span className="text-blue-300 italic uppercase tracking-tighter">{user?.name}</span>! 👋
            </h1>
            <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
              {config.description}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl group hover:bg-white/20 transition-all duration-300">
             <div className="text-4xl group-hover:scale-125 transition-transform">🚇</div>
             <div>
               <p className="font-black text-2xl uppercase tracking-tighter">METRONET</p>
               <p className="text-xs text-blue-200 uppercase tracking-widest font-bold">Digital ID Verified</p>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.stats.map((stat, idx) => (
          <div key={idx} className="premium-card p-6 flex items-center justify-between group cursor-pointer hover:border-blue-200">
            <div>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors uppercase italic">{stat.value}</h3>
            </div>
            <div className="text-4xl bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all group-hover:bg-blue-50">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 italic">
             <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
             CHỨC NĂNG NHANH
          </h2>
          <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Cập nhật liên tục ↻</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.actions.map((action, idx) => (
            <Link 
              key={idx} 
              to={action.path}
              className="group"
            >
              <div className="premium-card h-full p-8 flex flex-col items-center justify-center text-center group-hover:-translate-y-2 group-active:scale-95 transition-all duration-300 border-b-8 border-transparent hover:border-blue-500">
                <div className={`w-20 h-20 ${action.color} rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-blue-500/20 mb-6 group-hover:rotate-12 group-hover:scale-110 transition-all`}>
                  {action.icon}
                </div>
                <h3 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors h-12 flex items-center italic tracking-tight">{action.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Placeholder for Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="premium-card p-8 bg-white border-l-8 border-blue-600">
          <h3 className="text-xl font-black mb-6 text-slate-800 tracking-tight flex items-center gap-2 italic">
            <span className="text-blue-600">🔔</span> THÔNG BÁO HỆ THỐNG
          </h3>
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 transition-all cursor-pointer">
                 <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">!</div>
                 <div>
                   <p className="font-bold text-slate-700 text-sm">Bảo trì tuyến số 02 vào chủ nhật 24/03</p>
                   <p className="text-xs text-slate-400 italic">2 giờ trước</p>
                 </div>
               </div>
             ))}
          </div>
        </section>

        <section className="premium-card p-8 bg-white border-l-8 border-indigo-600">
          <h3 className="text-xl font-black mb-6 text-slate-800 tracking-tight flex items-center gap-2 italic">
            <span className="text-indigo-600">🕒</span> HOẠT ĐỘNG GẦN ĐÂY
          </h3>
          {user?.role === 'passenger' && stats.transactions.length > 0 ? (
            <div className="space-y-4">
              {stats.transactions.map((t) => (
                <div key={t._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                   <div className="flex items-center gap-3">
                      <div className="text-2xl">{t.type === 'topup' ? '💰' : '🎫'}</div>
                      <div>
                         <p className="font-bold text-sm text-slate-700">{t.description}</p>
                         <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest italic">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className={`font-black italic tracking-tighter ${t.type === 'topup' ? 'text-green-600' : 'text-slate-900'}`}>
                      {t.type === 'topup' ? '+' : '-'}{t.amount.toLocaleString()}đ
                   </div>
                </div>
              ))}
              <Link to="/transactions" className="block text-center text-xs font-black text-blue-600 mt-4 uppercase tracking-[0.2em] hover:underline">Xem tất cả ➔</Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-slate-400 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
               <div className="text-4xl mb-2 opacity-50">📤</div>
               <p className="font-bold uppercase text-[10px] tracking-widest">Không có hoạt động mới</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
