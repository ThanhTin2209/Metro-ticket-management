import React, { useState, useEffect } from 'react';
import metroService from '../services/metro.service';

const InspectionHistory = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await metroService.getInspections();
      setInspections(data);
    } catch (err) {
      console.error('Error loading inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2 flex items-center gap-4 uppercase">
            <span className="w-12 h-12 bg-blue-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30 not-italic">🔍</span>
            LỊCH SỬ KIỂM TRA CHI TIẾT
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] ml-2">Nhật ký đi tuần • Kiểm soát vé • Tra soát</p>
        </div>
        <button onClick={loadInspections} className="px-6 py-2 bg-slate-100 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">Làm mới 🔄</button>
      </div>

      <section className="premium-card p-0 bg-white overflow-hidden border-b-8 border-blue-600">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Thời gian</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Mã vé</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Nhân viên kiểm tra</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Kết quả</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-6 bg-slate-50/50"></td>
                  </tr>
                ))
              ) : inspections.length > 0 ? (
                inspections.map((ins, idx) => (
                  <tr key={ins._id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-8 py-6">
                       <p className="font-black text-slate-800 text-xs tracking-tight uppercase leading-none mb-1">{new Date(ins.createdAt).toLocaleDateString()}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(ins.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-8 py-6 font-black text-blue-600 text-xs tracking-widest uppercase italic group-hover:scale-110 transition-transform origin-left">
                       {ins.ticketCode}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-[10px] uppercase">
                             {ins.performedBy?.userId?.name?.[0]}
                          </div>
                          <span className="font-black text-slate-800 text-[10px] uppercase tracking-tighter italic">{ins.performedBy?.userId?.name}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest italic border shadow-sm ${
                         ins.result === 'CHECKED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                       }`}>
                          {ins.result}
                       </span>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hợp lệ ✔</p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-300 font-black italic uppercase text-sm tracking-widest">
                     Chưa có lịch sử kiểm tra thủ công nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="premium-card p-8 bg-blue-50 border-none flex flex-col items-center">
            <span className="text-4xl mb-3">🚈</span>
            <h4 className="font-black italic text-sm text-blue-900 uppercase tracking-tight">Số lần kiểm tra</h4>
            <p className="text-3xl font-black text-blue-600 tracking-tighter mt-1">{inspections.length}</p>
         </div>
      </div>
    </div>
  );
};

export default InspectionHistory;
