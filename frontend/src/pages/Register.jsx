import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.');
    }

    setLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse delay-700"></div>

      <div className="w-full max-w-lg bg-white/10 backdrop-blur-2xl p-10 rounded-[2rem] shadow-2xl border border-white/20 relative z-10 transition-all duration-500 hover:shadow-blue-500/10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30 mb-6 rotate-12 transition-transform hover:rotate-0 duration-300">
            🚇
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter mb-2">METRONET</h1>
          <p className="text-blue-200/60 text-sm font-medium tracking-widest uppercase">Gia nhập hệ thống Metro hiện đại</p>
        </div>

        {error && <Alert type="error" className="mb-6 rounded-xl border-red-500/30 bg-red-500/10 text-red-100" onClose={() => setError(null)}>{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              id="name"
              label="Họ và tên"
              placeholder="Họ Tên Của Bạn"
              value={formData.name}
              onChange={handleChange}
              required
              className="text-white placeholder-gray-500"
            />
            <Input
              id="email"
              label="Địa chỉ Email"
              type="email"
              placeholder="Email Của Bạn"
              value={formData.email}
              onChange={handleChange}
              required
              className="text-white placeholder-gray-500"
            />
          </div>
          <Input
            id="password"
            label="Mật khẩu"
            type="password"
            placeholder="Mật khẩu (Ít nhất 6 ký tự)"
            value={formData.password}
            onChange={handleChange}
            required
            className="text-white placeholder-gray-500"
          />
          <Input
            id="confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="Xác nhận lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="text-white placeholder-gray-500"
          />
          
          <Button 
            type="submit" 
            variant="primary" 
            className="w-full justify-center !py-4 text-lg font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-500"
            loading={loading}
          >
            {loading ? 'Đang khởi tạo tài khoản...' : 'ĐĂNG KÝ NGAY'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 decoration-2 transition-all">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
      
      <div className="fixed bottom-6 text-gray-500 text-xs font-bold tracking-[0.2em] uppercase mix-blend-difference">
        © 2026 METRONET DIGITAL INFRASTRUCTURE
      </div>
    </div>
  );
};

export default Register;
