import React, { useState } from 'react';
import metroService from '../services/metro.service';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const TicketValidation = () => {
  const [ticketCode, setTicketCode] = useState('');
  const [stationCode, setStationCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleValidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await metroService.validateTicket(ticketCode, stationCode);
      setResult(data);
      
      // Add to local history
      const newEntry = {
        code: ticketCode,
        station: stationCode,
        status: data.validationStatus,
        time: new Date().toLocaleTimeString(),
        id: Date.now()
      };
      setHistory([newEntry, ...history].slice(0, 5));
      
      // Auto clear input for next validation
      setTicketCode('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi soát vé. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    'ALLOW': 'bg-green-100 text-green-800 border-green-500 shadow-xl shadow-green-500/20',
    'DENY': 'bg-red-100 text-red-800 border-red-500 shadow-xl shadow-red-500/20',
    'EXPIRED': 'bg-yellow-100 text-yellow-800 border-yellow-500 shadow-xl shadow-yellow-500/20',
    'ALREADY_IN': 'bg-orange-100 text-orange-800 border-orange-500 shadow-xl shadow-orange-500/20',
  };

  const statusIcons = {
    'ALLOW': '✅',
    'DENY': '❌',
    'EXPIRED': '⏳',
    'ALREADY_IN': '🚫',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-4">
         <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">🚥</div>
         <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Soát Vé Tại Cổng</h1>
            <p className="text-slate-500 font-medium">Nhập mã vé và mã trạm để xác thực quyền ra/vào.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="premium-card p-10">
          <h2 className="text-lg font-black mb-8 border-b border-slate-100 pb-4 text-slate-700 flex items-center gap-2">
            <span className="text-blue-500">⌨️</span> FORM NHẬP LIỆU
          </h2>
          <form onSubmit={handleValidate} className="space-y-6">
            <Input
              id="ticketCode"
              label="Mã vé (Ticket ID)"
              placeholder="Ví dụ: TKT-123456"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              required
              className="group"
              icon={<span className="text-xl">🎫</span>}
            />
            <Input
              id="stationCode"
              label="Mã trạm (Station ID)"
              placeholder="Ví dụ: STN-DISTRIC1"
              value={stationCode}
              onChange={(e) => setStationCode(e.target.value)}
              required
              className="group"
              icon={<span className="text-xl">🏠</span>}
            />
            <Button 
                type="submit" 
                variant="primary" 
                className="w-full !py-4 justify-center text-lg font-extrabold shadow-blue-500/30 active:scale-95 transition-all"
                loading={loading}
            >
              🚀 XÁC THỰC NGAY
            </Button>
          </form>

          {error && <Alert type="error" className="mt-8 rounded-2xl animate-shake">{error}</Alert>}
        </section>

        <section className="space-y-8">
          <div className={`premium-card p-10 h-full flex flex-col items-center justify-center transition-all duration-500 border-4 border-dashed ${result ? statusStyles[result.validationStatus] : 'bg-slate-50 border-slate-200'}`}>
            {!result ? (
              <div className="text-center opacity-40 animate-pulse">
                <div className="text-7xl mb-6">🔳</div>
                <p className="font-black text-lg uppercase tracking-[0.3em]">Đang chờ dữ liệu</p>
                <p className="text-xs mt-2 font-bold italic">SẴN SÀNG KIỂM TRA</p>
              </div>
            ) : (
              <div className="text-center space-y-6 animate-pop-in">
                <div className="text-8xl transform active:scale-125 transition-transform cursor-default">{statusIcons[result.validationStatus]}</div>
                <h3 className="text-4xl font-black italic tracking-tighter uppercase">{result.validationStatus}</h3>
                <div className="space-y-2 py-4 border-y border-black/10">
                   <p className="text-sm font-bold uppercase tracking-widest text-black/60">Chi tiết vé</p>
                   {result.ticket && (
                      <>
                        <p className="font-extrabold text-xl">Loại: {result.ticket.type?.name}</p>
                        <p className="font-medium">Hạn: {new Date(result.ticket.expiryDate).toLocaleDateString()}</p>
                      </>
                   )}
                </div>
                <p className="bg-white/30 backdrop-blur-sm rounded-full px-6 py-2 inline-block font-black text-xs uppercase shadow-sm">
                   STATUS VERIFIED ✔
                </p>
              </div>
            )}
          </div>

          <div className="premium-card p-8">
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center justify-between">
                <span>Lịch sử gần đây</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">5 BẢN GHI</span>
             </h3>
             <div className="space-y-3">
                {history.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:scale-[1.02] transition-transform">
                     <div className="flex items-center gap-3">
                        <span className="text-xl">{statusIcons[item.status]}</span>
                        <div>
                           <p className="font-black text-xs text-slate-800 italic uppercase">{item.code}</p>
                           <p className="text-[10px] font-bold text-slate-400 tracking-tighter uppercase">{item.station} • {item.time}</p>
                        </div>
                     </div>
                     <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${item.status === 'ALLOW' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                        {item.status}
                     </span>
                  </div>
                ))}
                {history.length === 0 && (
                   <p className="text-center text-xs font-bold text-slate-300 py-4 italic uppercase">Chưa có lịch sử</p>
                )}
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TicketValidation;
