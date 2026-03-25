import React, { useState } from 'react';
import metroService from '../services/metro.service';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Notification from '../components/Notification';
import { useAuth } from '../contexts/AuthContext';

const TopUp = () => {
  const [showMomoModal, setShowMomoModal] = useState(false);
  const { user, getMe } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const presets = [50000, 100000, 200000, 500000, 1000000];

  const handleOpenPayment = (e) => {
    e.preventDefault();
    const topUpAmount = parseInt(amount);
    
    if (!topUpAmount || topUpAmount <= 0) {
      return setError('Vui lòng nhập số tiền hợp lệ.');
    }
    setError(null);
    setShowMomoModal(true);
  };

  const processPayment = async () => {
    const topUpAmount = parseInt(amount);
    setLoading(true);
    setError(null);

    try {
      await metroService.topUpAccount(topUpAmount);
      setShowMomoModal(false);
      setNotification({ message: `Đã nạp ${topUpAmount.toLocaleString()}đ qua Cổng thanh toán thành công!`, type: 'success' });
      setAmount('');
      // Refresh user data (balance)
      await getMe();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi kết nối ngân hàng. Vui lòng thử lại.');
       setShowMomoModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2 flex items-center gap-4">
            <span className="w-12 h-12 bg-blue-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30 not-italic">💰</span>
            NẠP TIỀN TÀI KHOẢN
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] ml-2">Tăng số dư để sử dụng dịch vụ Metro</p>
        </div>
        <div className="premium-card px-10 py-6 bg-slate-900 border-b-8 border-blue-600 text-white flex flex-col items-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">Ví điện tử hiện tại</p>
           <p className="text-3xl font-black italic tracking-tight">{(user?.balance || 0).toLocaleString()}đ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="premium-card p-10 bg-white">
          <h3 className="text-lg font-black mb-8 border-b border-slate-100 pb-4 text-slate-700 flex items-center gap-2 uppercase tracking-tighter italic">
            <span className="text-blue-600">🏦</span> Phương thức thanh toán
          </h3>
          
          <div className="space-y-6">
             <div className="flex gap-2 flex-wrap">
                {presets.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setAmount(p.toString())}
                    className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 font-black text-xs text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-lg transition-all"
                  >
                    +{p.toLocaleString()}đ
                  </button>
                ))}
             </div>

             <form onSubmit={handleOpenPayment} className="space-y-6">
                <Input
                  id="amount"
                  label="Số tiền muốn nạp (VNĐ)"
                  type="number"
                  placeholder="Nhập số tiền khác..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="group"
                  icon={
                    <span className="text-xl">💳</span>
                  }
                />
                <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full !py-4 justify-center text-lg font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all !bg-blue-600 border-none uppercase italic"
                >
                   TIẾP TỤC ĐẾN CỔNG THANH TOÁN
                </Button>
             </form>
          </div>
        </section>

        <section className="space-y-6">
           <div className="premium-card p-10 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 text-white/5 text-8xl font-black opacity-20 group-hover:rotate-12 transition-transform select-none uppercase italic">SAFE</div>
              <h3 className="text-sm font-black text-blue-200 uppercase tracking-widest mb-6">Bảo mật giao dịch</h3>
              <p className="text-xl font-black italic tracking-tight leading-relaxed mb-6">Sử dụng mã VietQR chuẩn hóa để nạp tiền từ mọi ngân hàng.</p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-200 opacity-60">
                 <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                 Gateway Thanh Toán Đã Sẵn Sàng
              </div>
           </div>
        </section>
      </div>

      {/* Simulated Payment Gateway Modal */}
      {showMomoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500">
              {/* Payment Header - Smaller */}
              <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl font-black italic">METRO</div>
                 <div className="w-10 h-10 bg-white rounded-xl mx-auto flex items-center justify-center text-xl mb-2 shadow-xl">
                    🏦
                 </div>
                 <h2 className="text-md font-black italic tracking-widest uppercase">Cổng thanh toán</h2>
                 <p className="text-blue-200 text-[8px] font-bold tracking-[0.3em]">METRONET SECURE GATEWAY</p>
              </div>

              {/* QR Section - Much Larger */}
              <div className="p-8 text-center space-y-8">
                 <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 flex flex-col items-center">
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-6">Quét mã VietQR để thanh toán</p>
                    <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 group">
                       <img 
                          src={`https://img.vietqr.io/image/970415-102874556688-compact2.png?amount=${amount}&addInfo=NAP%20TIEN%20METRO%20${user?.name}&accountName=METRONET%20CENTER`} 
                          alt="VietQR Metro" 
                          className="w-64 h-64 object-contain transition-transform group-hover:scale-105"
                       />
                    </div>
                    <div className="mt-8">
                       <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">Số tiền quyết toán</p>
                       <p className="text-5xl font-black italic text-blue-600 tracking-tighter">{parseInt(amount).toLocaleString()}đ</p>
                    </div>
                 </div>

                 <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3 text-left">
                    <span className="text-xl">📱</span>
                    <p className="text-[8px] font-bold text-blue-600 leading-tight uppercase">
                       Dùng ứng dụng ngân hàng quét mã và xác nhận chuyển khoản.
                    </p>
                 </div>
              </div>

              <div className="p-6 pt-0 space-y-2">
                 <Button 
                    variant="primary" 
                    className="w-full !py-5 justify-center !bg-blue-600 font-black italic tracking-tighter uppercase text-md animate-pulse border-none shadow-2xl shadow-blue-500/30"
                    onClick={processPayment}
                    loading={loading}
                 >
                    {loading ? 'Đang kiểm tra...' : 'XÁC NHẬN ĐÃ THANH TOÁN ✅'}
                 </Button>
                 <button 
                  onClick={() => setShowMomoModal(false)}
                  className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                 >
                   Hủy bỏ giao dịch
                 </button>
              </div>
           </div>
        </div>
      )}

      {error && <Alert type="error" className="rounded-2xl animate-shake mt-10">{error}</Alert>}
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default TopUp;
