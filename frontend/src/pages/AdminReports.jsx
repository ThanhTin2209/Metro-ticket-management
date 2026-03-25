import React, { useState, useEffect } from 'react';
import adminService from '../services/admin.service';

const AdminReports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getReportStats();
      setRevenueData(data.revenueData);
    } catch (err) {
      console.error("Lỗi lấy thống kê", err);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1000000);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mb-2 uppercase">BÁO CÁO DOANH THU</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] ml-2">Số liệu • Phân tích • Tăng trưởng</p>
        </div>
        <div className="flex gap-4">
           <button className="premium-card px-6 py-3 bg-white text-slate-900 font-black italic text-xs hover:bg-slate-50 transition-all border border-slate-100 uppercase">
             XUẤT PDF 📄
           </button>
           <button className="premium-card px-6 py-3 bg-slate-900 text-white font-black italic text-xs hover:bg-slate-800 transition-all uppercase tracking-widest">
             XUẤT EXCEL 📊
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Tổng doanh thu tuần', value: (revenueData.reduce((acc, d) => acc + d.revenue, 0)).toLocaleString() + 'đ', change: '+12.5%', icon: '💰' },
           { label: 'Lượt khách tuần', value: '18,420', change: '+5.2%', icon: '🚶' },
           { label: 'Vé bán chạy nhất', value: 'Vé Ngày', change: '42%', icon: '🔥' },
           { label: 'Vi phạm ghi nhận', value: '12', change: '-15%', icon: '🛡️' },
         ].map((s, idx) => (
           <div key={idx} className="premium-card p-6 border-b-4 border-blue-600 bg-white">
             <div className="flex justify-between items-start mb-4">
                <span className="text-2xl bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">{s.icon}</span>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${s.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {s.change}
                </span>
             </div>
             <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-1">{s.label}</p>
             <h4 className="text-2xl font-black italic tracking-tighter text-slate-800">{s.value}</h4>
           </div>
         ))}
      </div>

      <section className="premium-card p-10 bg-white shadow-2xl shadow-slate-200/50">
        <h3 className="text-xl font-black mb-12 text-slate-800 italic tracking-tight flex items-center gap-3 uppercase">
          <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
          BIỂU ĐỒ DOANH THU 7 NGÀY GẦN NHẤT
        </h3>
        
        <div className="h-80 flex items-end justify-between gap-4 px-4 border-b-2 border-slate-100 pb-1 w-full bg-slate-50/20 rounded-t-3xl pt-20">
          {revenueData.map((d, idx) => {
            const barHeight = (d.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end pb-2">
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-black px-3 py-1.5 rounded-lg z-10 shadow-xl whitespace-nowrap">
                  {d.revenue.toLocaleString()}đ
                </div>
                <div 
                  className={`w-full max-w-[40px] bg-gradient-to-t from-blue-700 to-indigo-500 rounded-t-xl transition-all duration-1000 origin-bottom shadow-lg ${d.revenue === 0 ? 'opacity-20' : 'opacity-100'}`}
                  style={{ height: d.revenue > 0 ? `${Math.max(barHeight, 8)}%` : '8px' }}
                ></div>
                <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{d.day}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <section className="premium-card p-8 bg-white">
            <h3 className="text-lg font-black mb-6 text-slate-800 italic tracking-tight uppercase">Tuyến đường bận rộn nhất</h3>
            <div className="space-y-4">
               {[
                 { route: 'Tuyến số 01 (Bến Thành - Suối Tiên)', percent: 85 },
                 { route: 'Tuyến số 02 (Bến Thành - Tham Lương)', percent: 62 },
                 { route: 'Tuyến số 03 (Gò Vấp - Quận 1)', percent: 45 },
                 { route: 'Tuyến số 04 (Quận 12 - Phú Nhuận)', percent: 38 },
               ].map((r, i) => (
                 <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                       <span className="text-slate-600">{r.route}</span>
                       <span className="text-blue-600">{r.percent}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" style={{ width: `${r.percent}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </section>

         <section className="premium-card p-8 bg-white">
            <h3 className="text-lg font-black mb-6 text-slate-800 italic tracking-tight uppercase">Phân bổ loại vé</h3>
            <div className="flex items-center justify-around h-48">
               <div className="relative w-40 h-40 rounded-full border-[1.5rem] border-blue-600 flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 border-[1.5rem] border-slate-50 border-t-indigo-600 rounded-full transform rotate-[45deg]"></div>
                  <div className="text-center">
                     <p className="text-2xl font-black italic tracking-tighter text-slate-800">18k</p>
                     <p className="text-[10px] font-bold text-slate-400">TỔNG VÉ</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black italic">
                     <span className="w-3 h-3 bg-blue-600 rounded-sm"></span> VÉ LƯỢT (55%)
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black italic">
                     <span className="w-3 h-3 bg-indigo-600 rounded-sm"></span> VÉ THÁNG (25%)
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black italic">
                     <span className="w-3 h-3 bg-slate-200 rounded-sm"></span> KHÁC (20%)
                  </div>
               </div>
            </div>
         </section>
      </div>
    </div>
  );
};

export default AdminReports;
