import React, { useState, useEffect } from 'react';
import metroService from '../services/metro.service';
import Button from '../components/Button';
import Alert from '../components/Alert';

const ValidationHistory = () => {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await metroService.getValidations();
      setValidations(data || []);
    } catch (err) {
      setError('Lỗi khi tải lịch sử soát vé.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2 flex items-center gap-4 uppercase">
            <span className="w-12 h-12 bg-indigo-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-indigo-500/30 not-italic">📊</span>
            LỊCH SỬ SOÁT VÉ
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] ml-2">Nhật ký xác thực vé tại tất cả các trạm</p>
        </div>
        <Button variant="outline" onClick={loadHistory} className="font-black italic text-sm tracking-tighter px-6 bg-white">
          LÀM MỚI ↻
        </Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="premium-card overflow-hidden bg-white border-b-8 border-indigo-600">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Thời gian</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã Vé</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạm</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Người thực hiện</th>
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Kết quả</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {validations.length > 0 ? validations.map((v) => (
                      <tr key={v._id} className="hover:bg-indigo-50/30 transition-colors">
                         <td className="px-8 py-6">
                           <p className="text-sm font-bold text-slate-700">{new Date(v.occurredAt).toLocaleDateString()}</p>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{new Date(v.occurredAt).toLocaleTimeString()}</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-sm font-black italic text-indigo-600 tracking-tight uppercase">{v.ticketCode}</span>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                              {v.stationCode || 'N/A'}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-sm font-bold text-slate-700">{v.performedBy?.userId?.name || 'Unknown'}</p>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{v.performedBy?.role}</p>
                         </td>
                         <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-black text-[10px] uppercase tracking-widest italic border border-green-200">
                               SUCCESS
                            </span>
                         </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center font-bold text-slate-300 uppercase tracking-widest">Chưa có dữ liệu soát vé</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}
    </div>
  );
};

export default ValidationHistory;
