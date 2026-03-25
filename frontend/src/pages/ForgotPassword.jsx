import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setGeneratedPassword(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setGeneratedPassword(response.data.data.resetToken);
      setStatus({ 
        type: 'success', 
        message: 'Yêu cầu khôi phục đã được gửi! Vui lòng kiểm tra "Email" của bạn.' 
      });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl border border-white/20 relative z-10 transition-all duration-500 hover:shadow-blue-500/10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30 mb-6 rotate-12 transition-transform hover:rotate-0 duration-300">
            ✉️
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2 text-center uppercase">Khôi phục mật khẩu</h1>
          <p className="text-blue-200/60 text-sm font-medium text-center">Bảo mật hơn với mã xác nhận qua Email</p>
        </div>

        {status && (
          <Alert 
            type={status.type} 
            className={`mb-6 rounded-xl border-${status.type === 'error' ? 'red' : 'green'}-500/30 bg-${status.type === 'error' ? 'red' : 'green'}-500/10 text-white`}
          >
            {status.message}
          </Alert>
        )}

        {!generatedPassword ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              type="email"
              placeholder="Nhập Email để nhận mã khôi phục"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="group"
              icon={
                <svg className="w-5 h-5 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              }
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full justify-center !py-4 text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-500"
              loading={loading}
            >
              {loading ? 'Đang gửi yêu cầu...' : 'GỬI MÃ KHÔI PHỤC'}
            </Button>
          </form>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-300">
            <p className="text-gray-400 text-sm mb-2">Mã khôi phục của bạn (Demo):</p>
            <div className="bg-indigo-500/20 border border-indigo-500/30 py-3 px-2 rounded-xl mb-4 break-all">
              <span className="text-xs font-mono font-bold text-indigo-300">{generatedPassword}</span>
            </div>
            <p className="text-gray-400 text-xs mb-6 italic">Ghi chú: Trong môi trường thực tế, mã này sẽ được gửi kín vào Email của người dùng.</p>
            <Link to={`/reset-password?token=${generatedPassword}`} className="block w-full">
              <Button variant="primary" className="w-full justify-center">ĐẾN TRANG ĐỔI MẬT KHẨU</Button>
            </Link>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 font-medium">
            Quay lại trang {' '}
            <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 decoration-2 transition-all">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
