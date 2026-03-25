import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    if (!token) {
        setStatus({ type: 'error', message: 'Token đặt lại mật khẩu không hợp lệ.' });
        return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      setStatus({ type: 'success', message: 'Đặt lại mật khẩu thành công! Đang chuyển hướng đăng nhập...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.' });
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
            🔄
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2 text-center uppercase">Đặt lại mật khẩu</h1>
          <p className="text-blue-200/60 text-sm font-medium tracking-widest text-center">Hãy nhập mật khẩu mới của bạn</p>
        </div>

        {status && (
          <Alert 
            type={status.type} 
            className={`mb-6 rounded-xl border-${status.type === 'error' ? 'red' : 'green'}-500/30 bg-${status.type === 'error' ? 'red' : 'green'}-500/10 text-white`}
          >
            {status.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="newPassword"
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="group"
            icon={
              <svg className="w-5 h-5 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="group"
            icon={
              <svg className="w-5 h-5 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />
          
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full justify-center !py-4 text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-500"
            loading={loading}
          >
            {loading ? 'Đang cập nhật...' : 'CẬP NHẬT MẬT KHẨU'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 font-medium text-sm">
                Không thể khôi phục? {' '}
                <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 decoration-2 transition-all">
                    Về trang đăng nhập
                </Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
