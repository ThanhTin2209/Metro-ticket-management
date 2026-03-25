import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // Use the login function from AuthContext which handles storage
      const data = await login(email, password);
      
      if (data.requires2FA) {
        setRequires2FA(true);
        setUserIdFor2FA(data.userId);
        setLoading(false);
        return;
      }

      // Normal login success logic
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/2fa/login', { 
        userId: userIdFor2FA, 
        token: twoFACode 
      });
      
      const { accessToken, refreshToken, user: userData } = response.data.data;
      
      // Update LocalStorage and reload or update state
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      window.location.href = '/'; // Simple way to reset state and navigate
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác thực 2 bước không chính xác.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl border border-white/20 relative z-10 transition-all duration-500 hover:shadow-blue-500/10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30 mb-6 rotate-12 transition-transform hover:rotate-0 duration-300">
            {requires2FA ? '🛡️' : '🚇'}
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">
            {requires2FA ? 'XÁC THỰC 2 LỚP' : 'METRONET'}
          </h1>
          <p className="text-blue-200/60 text-sm font-medium tracking-widest uppercase">
            {requires2FA ? 'Nhập mã 6 số từ ứng dụng' : 'Hệ thống Quản lý Vé Tàu'}
          </p>
        </div>

        {error && <Alert type="error" className="mb-6 rounded-xl border-red-500/30 bg-red-500/10 text-red-200" onClose={() => setError(null)}>{error}</Alert>}

        {!requires2FA ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              type="email"
              placeholder="Địa chỉ Email"
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
            <Input
              id="password"
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="group"
              icon={
                <svg className="w-5 h-5 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <div className="flex justify-end -mt-2">
              <Link to="/forgot-password" size="sm" className="text-blue-200/50 hover:text-blue-300 font-medium text-sm transition-colors decoration-blue-500/30 hover:underline underline-offset-4">
                Quên mật khẩu?
              </Link>
            </div>
            
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full justify-center !py-4 text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-500"
              loading={loading}
            >
              {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP NGAY'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-6">
            <p className="text-center text-gray-400 text-sm">
              Tài khoản của bạn đã được bật bảo mật 2 lớp. 
              Vui lòng nhập mã từ ứng dụng quét QR của bạn.
            </p>
            <Input
              id="twoFACode"
              type="text"
              placeholder="Nhập mã 6 chữ số"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              required
              className="group text-center text-3xl font-mono tracking-[0.2em]"
              maxLength="6"
            />
            <Button 
                type="submit" 
                variant="primary" 
                className="w-full justify-center !py-4 text-lg font-bold shadow-xl shadow-indigo-500/20 active:scale-95 transition-all bg-indigo-600"
                loading={loading}
            >
              {loading ? 'Đang kiểm tra...' : 'XÁC THỰC 2 BƯỚC'}
            </Button>
            <button 
                type="button" 
                onClick={() => setRequires2FA(false)}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-400 transition-colors font-medium border-t border-white/5 pt-6"
            >
              Quay lại đăng nhập
            </button>
          </form>
        )}

        {!requires2FA && (
          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 font-medium">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 decoration-2 transition-all">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mix-blend-difference">
        © 2026 METRONET DIGITAL INFRASTRUCTURE
      </div>
    </div>
  );
};

export default Login;
