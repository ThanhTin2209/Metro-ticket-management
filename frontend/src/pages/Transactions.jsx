import React, { useState, useEffect } from 'react';
import metroService from '../services/metro.service';
import Alert from '../components/Alert';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await metroService.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Lỗi khi tải lịch sử giao dịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-4xl mb-4">📜</div>
        <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Đang truy xuất lịch sử tài chính...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mb-2">LỊCH SỬ GIAO DỊCH</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] ml-2">Minh bạch • Bảo mật • Chính xác</p>
        </div>
        <button 
          onClick={loadTransactions}
          className="premium-card px-8 py-3 bg-white text-slate-900 font-black italic text-sm hover:bg-slate-50 active:scale-95 transition-all"
        >
          LÀM MỚI ↻
        </button>
      </div>

      {error && <Alert type="error" className="rounded-[2rem] shadow-xl">{error}</Alert>}

      <div className="space-y-6">
        {transactions.length === 0 ? (
          <div className="premium-card p-20 flex flex-col items-center text-center text-slate-400">
            <div className="text-6xl mb-6 opacity-20 italic font-black">EMPTY</div>
            <p className="font-bold uppercase tracking-widest text-xs">Bạn chưa có giao dịch nào trong hệ thống</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t._id} className="premium-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-500/20 transition-all group">
              <div className="flex items-center gap-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                   t.type === 'topup' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                 } group-hover:scale-110 transition-transform`}>
                   {t.type === 'topup' ? '💰' : '🎫'}
                 </div>
                 <div>
                    <h3 className="font-black text-xl italic tracking-tight text-slate-800 lowercase first-letter:uppercase">{t.description}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formatDate(t.createdAt)}</p>
                 </div>
              </div>
              <div className="flex flex-col md:items-end">
                 <p className={`text-2xl font-black italic tracking-tighter ${
                   t.type === 'topup' ? 'text-green-600' : 'text-slate-900'
                 }`}>
                   {t.type === 'topup' ? '+' : '-'}{t.amount.toLocaleString()}đ
                 </p>
                 <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {t.status === 'success' ? 'Hoàn tất' : 'Chờ xử lý'}
                 </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-center pt-10">
         <div className="flex gap-4">
             <div className="w-3 h-3 rounded-full bg-slate-200 animate-bounce"></div>
             <div className="w-3 h-3 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.2s]"></div>
             <div className="w-3 h-3 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.4s]"></div>
         </div>
      </div>
    </div>
  );
};

export default Transactions;
