import React, { useState } from 'react';
import metroService from '../services/metro.service';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Notification from '../components/Notification';
import { useAuth } from '../contexts/AuthContext';

const PurchaseTicket = () => {
  const { user, getMe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const ticketTypes = [
    { id: 'oneway', name: 'Vé Lượt (Một chiều)', price: 15000, icon: '🎫', description: 'Có hiệu lực trong 24h kể từ khi mua.' },
    { id: 'daily', name: 'Vé Ngày (24h)', price: 40000, icon: '📅', description: 'Không giới hạn lượt đi trong 24h.' },
    { id: 'weekly', name: 'Vé Tuần (7 ngày)', price: 150000, icon: '🗓️', description: 'Tiết kiệm hơn cho nhu cầu đi lại hàng ngày.' },
    { id: 'monthly', name: 'Vé Tháng (30 ngày)', price: 450000, icon: '🏢', description: 'Lựa chọn tốt nhất cho người đi làm.' },
  ];

  const handlePurchase = async (type) => {
    if (user.balance < type.price) {
      return setError(`Số dư không đủ. Bạn cần thêm ${type.price - user.balance}đ để mua vé này.`);
    }

    setLoading(true);
    setError(null);

    try {
      await metroService.purchaseTicket({
        type: { name: type.name, price: type.price },
        origin: 'Station A', // Mock data
        destination: 'Station B' // Mock data
      });
      
      setNotification({ message: `Đã mua ${type.name} thành công!`, type: 'success' });
      // Update user balance in context
      await getMe();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi mua vé. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2">MUA VÉ TRỰC TUYẾN</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Tiện lợi • Nhanh chóng • Hiện đại</p>
        </div>
        <div className="px-10 py-6 bg-slate-900 border-b-8 border-blue-600 rounded-[2.5rem] text-white flex flex-col items-center shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-2 opacity-5 text-4xl font-black">BALANCE</div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 mb-1">Ví điện tử hiện tại</p>
           <p className="text-3xl font-black italic tracking-tight group-hover:scale-110 transition-transform">{(user?.balance || 0).toLocaleString()}đ</p>
        </div>
      </div>

      {error && <Alert type="error" className="rounded-[2rem] shadow-xl animate-shake" onClose={() => setError(null)}>{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ticketTypes.map((type) => (
          <div key={type.id} className="premium-card p-10 flex flex-col items-center text-center group hover:border-blue-500 transition-all duration-300">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 transition-all">
                {type.icon}
             </div>
             <h3 className="font-black text-xl italic tracking-tight text-slate-800 mb-2">{type.name}</h3>
             <p className="text-slate-400 text-xs font-bold mb-6 min-h-[40px] leading-relaxed uppercase tracking-tighter">{type.description}</p>
             <div className="text-3xl font-black text-blue-600 mb-8 italic tracking-tighter">{type.price.toLocaleString()}đ</div>
             <Button 
                variant="primary" 
                className="w-full justify-center !py-3 font-black text-sm uppercase shadow-xl shadow-blue-500/10"
                onClick={() => handlePurchase(type)}
                loading={loading}
             >
                MUA NGAY 💳
             </Button>
          </div>
        ))}
      </div>

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default PurchaseTicket;
