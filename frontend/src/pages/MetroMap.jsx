import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import metroService from '../services/metro.service';

const MetroMap = () => {
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetroData();
  }, []);

  const fetchMetroData = async () => {
    try {
      setLoading(true);
      const data = await metroService.getMetroData();
      setLines(data);
    } catch (error) {
      console.error("Lỗi khi tải bản đồ metro:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const activeLines = lines.filter(l => l.stations && l.stations.length > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mb-2 uppercase">LỘ TRÌNH HỆ THỐNG</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] ml-2">Sơ đồ mạng lưới • Trạm dừng • Trạng thái vận hành</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Đang hoạt động</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Bảo trì</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Line - Big view */}
        {activeLines.slice(0, 1).map(line => (
          <section key={line._id} className="lg:col-span-2 premium-card p-10 bg-white border-b-8 shadow-2xl transition-all" style={{ borderColor: line.color }}>
            <div className="flex items-center gap-4 mb-12">
               <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-xl" style={{ backgroundColor: line.color, boxShadow: `0 20px 25px -5px ${line.color}44` }}>
                  {line.code[1] || '1'}
               </div>
               <div>
                  <h2 className="text-2xl font-black italic text-slate-800 tracking-tight uppercase">{line.name}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: line.color }}>STATUS: {line.status === 'active' ? 'ĐANG VẬN HÀNH' : 'BẢO TRÌ HỆ THỐNG'}</p>
               </div>
            </div>

            <div className="relative ml-6 space-y-0">
               <div className="absolute left-[20px] top-6 bottom-6 w-1 rounded-full opacity-30" style={{ backgroundColor: line.color }}></div>

               {line.stations.map((s, idx) => (
                  <div key={s._id} className="relative pl-16 pb-12 group last:pb-0">
                     <div className={`absolute left-0 top-1 w-10 h-10 rounded-2xl flex items-center justify-center z-10 p-1 transition-all duration-300 group-hover:scale-125 bg-white border-4 shadow-sm`} style={{ borderColor: s.status === 'active' ? line.color : '#ef4444' }}>
                        <div className={`w-3 h-3 rounded-full animate-pulse`} style={{ backgroundColor: s.status === 'active' ? line.color : '#ef4444' }}></div>
                     </div>

                     <div className="premium-card p-6 bg-slate-50 border-none group-hover:bg-blue-50 transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: line.color }}>{s.code}</p>
                              <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">{s.name}</h3>
                           </div>
                           <div className="text-right">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</span>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${s.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                 {s.status === 'active' ? 'Khả dụng ✔' : 'Bảo trì ✖'}
                              </p>
                           </div>
                        </div>
                        <div className="flex gap-2 mt-4 flex-wrap">
                           {s.facilities?.map(f => (
                             <span key={f} className="text-[10px] px-2 py-1 bg-white rounded-md font-bold text-slate-400 border border-slate-100 uppercase">{f}</span>
                           ))}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          </section>
        ))}

        {/* Other Lines & Info */}
        <aside className="space-y-8">
           {activeLines.slice(1).map(line => (
             <section key={line._id} className="premium-card p-8 bg-white border-l-8 shadow-2xl transition-all" style={{ borderLeftColor: line.color }}>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-xl rotate-3" style={{ backgroundColor: line.color, boxShadow: `0 20px 25px -5px ${line.color}44` }}>
                      {line.code[1] || '2'}
                   </div>
                   <div>
                      <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-800">{line.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest mt-1" style={{ color: line.color }}>{line.status === 'active' ? 'Vận hành' : 'Thi công'} ⚙️</p>
                   </div>
                </div>
                <div className="space-y-4">
                   {line.stations.map(s => (
                      <div key={s._id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:translate-x-2 transition-all cursor-pointer group">
                         <div className="flex justify-between items-center mb-1">
                            <h4 className="font-black italic uppercase text-sm tracking-tight text-slate-700 transition-colors uppercase">{s.name}</h4>
                            <span className={`text-[8px] px-2 py-1 rounded-lg font-black uppercase tracking-widest shadow-lg ${s.status === 'active' ? 'bg-green-600 shadow-green-500/20' : 'bg-red-600 shadow-red-500/20 animate-pulse'} text-white`}>
                              {s.status === 'active' ? 'Khả dụng' : 'Bảo trì'}
                            </span>
                         </div>
                         <p className="text-[10px] text-slate-400 italic font-medium tracking-widest uppercase">{s.code}</p>
                      </div>
                   ))}
                </div>
             </section>
           ))}

           <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl shadow-inner">
             <div className="flex items-start gap-4">
                <span className="text-2xl">🚧</span>
                <div>
                   <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-relaxed">
                      SƠ ĐỒ HỆ THỐNG
                   </p>
                   <p className="text-[10px] font-medium text-amber-600 uppercase mt-1">
                      Các trạm đang được cập nhật trạng thái thời gian thực từ trung tâm điều hành.
                   </p>
                </div>
             </div>
           </div>

           <section className="premium-card p-8 bg-white border-l-8 border-slate-900">
              <h3 className="text-sm font-black italic tracking-widest uppercase mb-6 flex items-center gap-2 text-slate-900">
                 <span className="text-xl not-italic">ℹ️</span> QUY ĐỊNH NHÀ GA
              </h3>
              <ul className="space-y-4">
                 {[
                   'Không mang chất dễ cháy nổ',
                   'Giữ gìn vệ sinh chung',
                   'Xếp hàng phía sau vạch vàng',
                   'Cần có vé hợp lệ trước khi vào cổng'
                 ].map((text, i) => (
                   <li key={i} className="flex gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span className="text-blue-600">●</span> {text}
                   </li>
                 ))}
              </ul>
           </section>

           <div className="premium-card p-6 bg-blue-50 border-none flex flex-col items-center text-center group">
              <div className="text-4xl mb-3 group-hover:rotate-12 transition-transform">📱</div>
              <h4 className="font-black italic text-sm text-blue-900 uppercase tracking-tight">Mua vé nhanh chóng</h4>
              <p className="text-[9px] font-medium text-blue-700/70 mb-4 px-4 uppercase tracking-widest">Hãy tích lũy số dư trong ví để mua vé Metro nhanh hơn!</p>
              <button 
                onClick={() => navigate('/topup')}
                className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all"
              >
                 NẠP TIỀN NGAY
              </button>
           </div>
        </aside>
      </div>
    </div>
  );
};

export default MetroMap;
