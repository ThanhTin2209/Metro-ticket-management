import React, { useState, useEffect } from 'react';
import metroService from '../services/metro.service';
import Button from '../components/Button';
import Alert from '../components/Alert';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await metroService.getMyTickets();
      setTickets(data);
    } catch (err) {
      setError('Lỗi khi tải danh sách vé. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'active': 'bg-green-100 text-green-700 border-green-200',
    'used': 'bg-slate-100 text-slate-500 border-slate-200',
    'expired': 'bg-red-100 text-red-500 border-red-200',
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center animate-pulse">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-4 text-white">📇</div>
        <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Đang đồng bộ dữ liệu vé của bạn...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2 flex items-center gap-4">
            <span className="w-12 h-12 bg-blue-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30 not-italic">📇</span>
            VÉ CỦA TÔI
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] ml-2">Quản lý vé và quyền truy cập metro</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100 font-black italic tracking-tighter text-sm px-6" onClick={loadTickets}>
              TẢI LẠI ↻
           </Button>
        </div>
      </div>

      {error && <Alert type="error" className="mb-6 rounded-[2rem] shadow-xl">{error}</Alert>}

      {tickets.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem]">
          <div className="text-7xl mb-6 opacity-20 grayscale">🎟️</div>
          <p className="font-black uppercase text-sm tracking-[0.3em] mb-4">Bạn chưa sở hữu chiếc vé nào</p>
          <Button variant="primary" className="font-black italic text-xs tracking-widest shadow-xl shadow-blue-500/10">MUA VÉ NGAY 🚀</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map((t) => (
            <div 
              key={t._id} 
              onClick={() => setSelectedTicket(t)}
              className="premium-card p-1 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
            >
              {/* Ticket Top */}
              <div className="bg-slate-900 p-8 text-white rounded-[2rem] rounded-b-none relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 text-white/5 text-8xl font-black italic select-none">TKT</div>
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                       <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest italic border shadow-lg ${statusColors[t.status]}`}>
                          {t.status}
                       </span>
                       <span className="text-blue-400 font-black italic tracking-tighter uppercase text-xs">{t.type.name}</span>
                    </div>
                    <h3 className="text-4xl font-black italic tracking-tighter mb-1 lowercase first-letter:uppercase">{t.code}</h3>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-4">Hạn dùng: {new Date(t.expiryDate).toLocaleDateString()}</p>
                 </div>
              </div>

              {/* Dotted Divider */}
              <div className="bg-white px-8 relative h-1 flex items-center justify-between">
                 <div className="absolute left-0 -ml-4 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 shadow-inner"></div>
                 <div className="flex-1 border-t-2 border-dashed border-slate-100 mx-4"></div>
                 <div className="absolute right-0 -mr-4 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 shadow-inner"></div>
              </div>

              {/* Ticket Bottom - Real QR Code */}
              <div className="bg-white p-8 pt-10 text-center rounded-[2rem] rounded-t-none">
                 <div className="w-32 h-32 mx-auto bg-white p-2 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-3 group-hover:scale-110 transition-all border border-slate-100">
                    <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.code}`} 
                       alt="Ticket QR Code" 
                       className="w-full h-full object-contain"
                    />
                 </div>
                 <p className="text-[10px] font-black italic text-slate-400 uppercase tracking-[0.3em] mt-6 group-hover:text-blue-600 transition-colors">Scan at Gate to Enter</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedTicket(null)}
        >
           <div 
             className="w-full max-w-sm bg-white rounded-[3rem] p-1 shadow-2xl animate-in zoom-in duration-300"
             onClick={e => e.stopPropagation()}
           >
              <div className="bg-slate-900 rounded-[2.8rem] p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 text-white/5 text-9xl font-black italic select-none">METRO</div>
                 <div className="flex justify-between items-start mb-10">
                    <span className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest border shadow-xl ${statusColors[selectedTicket.status]}`}>
                       {selectedTicket.status}
                    </span>
                    <button onClick={() => setSelectedTicket(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">✕</button>
                 </div>
                 <p className="text-blue-400 font-black italic tracking-widest uppercase text-xs mb-2">Vé điện tử hệ thống</p>
                 <h2 className="text-5xl font-black italic tracking-tighter mb-6 lowercase first-letter:uppercase">{selectedTicket.code}</h2>
                 
                 <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex justify-between">
                       <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Loại Vé</span>
                       <span className="font-bold text-sm">{selectedTicket.type.name}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-white/40 font-bold uppercase text-[10px] tracking-widest">Hạn dùng</span>
                       <span className="font-bold text-sm">{new Date(selectedTicket.expiryDate).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>

              <div className="p-10 text-center">
                 <div className="w-56 h-56 mx-auto bg-white p-4 rounded-3xl shadow-xl mb-6 border border-slate-100 flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedTicket.code}`} 
                      alt="Large QR Code" 
                      className="w-full h-full object-contain"
                    />
                 </div>
                 <p className="text-xs font-black italic text-slate-400 uppercase tracking-widest leading-loose">
                    Đưa mã này vào máy quét tại cổng soát vé<br/>để được chấp nhận vào ga.
                 </p>
              </div>

              <div className="p-4 pt-0">
                 <Button variant="primary" className="w-full justify-center !py-4 font-black italic tracking-tighter uppercase text-sm" onClick={() => setSelectedTicket(null)}>
                    ĐÓNG ✕
                 </Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyTickets;
