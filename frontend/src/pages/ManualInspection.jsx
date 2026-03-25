import React, { useState } from 'react';
import metroService from '../services/metro.service';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const ManualInspection = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInspect = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await metroService.manualInspection(ticketCode);
      setResult(data.ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy thông tin vé hoặc mã vé không hợp lệ.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'used': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'expired': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2 flex items-center gap-3">
             <span className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/30 not-italic">🔍</span>
             KIỂM TRA THỦ CÔNG
          </h1>
          <p className="text-blue-100/60 font-bold uppercase text-[10px] tracking-[0.3em]">Hệ thống Xác thực Kiểm soát viên</p>
        </div>
        
        <form onSubmit={handleInspect} className="relative z-10 flex flex-col sm:flex-row gap-3 min-w-[320px]">
           <div className="flex-1">
              <Input
                id="searchCode"
                placeholder="Nhập mã vé (VD: TKT-XYZ)..."
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                required
                className="mb-0 !bg-slate-800 !border-slate-700 !text-white placeholder-slate-500"
              />
           </div>
           <Button 
                type="submit" 
                variant="primary" 
                className="!py-3 px-8 justify-center font-black italic tracking-tight shadow-blue-500/20 active:scale-95 transition-all"
                loading={loading}
           >
              TRA CỨU 🚀
           </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 space-y-6">
           <div className="premium-card p-10 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-slate-100 text-8xl font-black opacity-20 pointer-events-none group-hover:rotate-12 transition-transform select-none">TKT</div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Trạng thái thẻ</h3>
              
              {!result ? (
                 <div className="text-center py-10">
                   <div className="text-6xl mb-4 opacity-30 grayscale filter invert">🗃️</div>
                   <p className="font-black text-slate-300 italic uppercase">Vui lòng nhập mã để xem dữ liệu</p>
                 </div>
              ) : (
                 <div className="space-y-8 animate-pop-in">
                    <div className="flex flex-col items-center gap-4">
                       <span className={`px-6 py-2 rounded-full font-black text-xs uppercase border-2 shadow-lg ${getStatusColor(result.status)}`}>
                          {result.status}
                       </span>
                       <h4 className="text-4xl font-black tracking-tighter italic text-slate-800 lowercase first-letter:uppercase">{result.code}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số dư</span>
                          <span className="font-black text-blue-600 italic">500,000đ</span>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Lượt đi</span>
                          <span className="font-black text-indigo-600 italic">12</span>
                       </div>
                    </div>
                 </div>
              )}
           </div>

           <div className="premium-card p-8 bg-slate-900 text-white shadow-xl shadow-blue-900/10 active:scale-[0.98] transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-red-600/30 group-hover:rotate-12 transition-transform">📝</div>
                 <div>
                    <h4 className="font-black italic text-lg tracking-tight">LẬP BIÊN BẢN</h4>
                    <p className="text-xs text-red-200 uppercase font-bold tracking-widest opacity-60">Xử lý vi phạm ngay</p>
                 </div>
              </div>
           </div>
        </section>

        <section className="lg:col-span-2">
           <div className="premium-card p-10 h-full backdrop-blur-sm relative border-blue-500/10">
              <h3 className="text-xl font-black mb-10 text-slate-800 tracking-tight flex items-center gap-3">
                 <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                 Chi Tiết Lịch Trình & Giao Dịch
              </h3>
              
              {!result ? (
                 <div className="h-96 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <div className="text-5xl mb-4 opacity-20">📡</div>
                    <p className="font-black uppercase text-xs tracking-[0.3em]">Hệ thống Metro Intelligence đang chờ kết nối</p>
                 </div>
              ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 border-b-4 border-b-blue-500">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin sở hữu</p>
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-500/20">{result.owner?.name?.[0]}</div>
                            <div>
                               <p className="font-black text-xl italic tracking-tight">{result.owner?.name}</p>
                               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{result.owner?.email}</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 border-b-4 border-b-indigo-500">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Loại vé & Hạn dùng</p>
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-md">🎟️</div>
                            <div>
                               <p className="font-black text-xl italic tracking-tight">{result.type?.name}</p>
                               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hết hạn: {new Date(result.expiryDate).toLocaleDateString()}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="overflow-hidden rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
                      <table className="w-full text-left">
                         <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                               <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Hoạt động</th>
                               <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Vị trí</th>
                               <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-500 text-right">Thời gian</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {[1, 2, 3].map(i => (
                               <tr key={i} className="hover:bg-blue-50/30 transition-colors group cursor-pointer">
                                  <td className="px-6 py-4 font-bold text-slate-700 text-sm italic group-hover:text-blue-600 transition-colors">Vào trạm cổng soát 1</td>
                                  <td className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 italic">STN-METRO-05</td>
                                  <td className="px-6 py-4 text-right text-xs font-black text-slate-500">20/03/2026 10:15</td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              )}
              {error && <Alert type="error" title="CẢNH BÁO KIỂM TRA" className="mt-8 rounded-3xl animate-shake">{error}</Alert>}
           </div>
        </section>
      </div>
      
      <div className="flex justify-center pt-10">
         <div className="bg-slate-100 border border-slate-200 rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic animate-pulse">
            Secure Digital Metro Intelligence Protocol • v1.0.4-LOCKED
         </div>
      </div>
    </div>
  );
};

export default ManualInspection;
