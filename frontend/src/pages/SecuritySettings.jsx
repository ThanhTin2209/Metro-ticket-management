import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { useAuth } from '../contexts/AuthContext';

const SecuritySettings = () => {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2FA States
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState(null); // 'setup', 'verify'
  const [qrCodeData, setQrCodeData] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');

  // Sessions State
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
    if(user) setIs2FAEnabled(user.isTwoFactorEnabled);
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/auth/sessions');
      setSessions(response.data.data.sessions);
    } catch (err) {
      console.error('Không thể lấy danh sách phiên', err);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if(!window.confirm('Phiên này sẽ bị đăng xuất. Bạn có chắc không?')) return;
    setLoading(true);
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      setSessions(sessions.filter(s => s._id !== sessionId));
      setStatus({ type: 'success', message: 'Đã thu hồi phiên đăng nhập.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Không thể thu hồi phiên. Thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Mật khẩu mới và xác nhận không khớp.' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/change-password', 
        { oldPassword, newPassword }
      );
      setStatus({ type: 'success', message: 'Đổi mật khẩu thành công!' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/2fa/setup', {});
      setQrCodeData(response.data.data.qrCode);
      setSetupStep('verify');
    } catch (err) {
      setStatus({ type: 'error', message: 'Không thể thiết lập 2FA. Thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/2fa/verify', { token: twoFACode });
      setIs2FAEnabled(true);
      setSetupStep(null);
      setStatus({ type: 'success', message: 'Xác thực 2 lớp (2FA) đã được kích hoạt!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Mã xác thực không đúng. Hãy thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Bạn có chắc muốn tắt 2FA? Điều này sẽ giảm bảo mật tài khoản.')) return;
    setLoading(true);
    try {
      await api.post('/auth/2fa/disable', {});
      setIs2FAEnabled(false);
      setStatus({ type: 'success', message: 'Đã tắt xác thực 2 lớp.' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Có lỗi xảy ra. Không thể tắt 2FA.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tighter">Cài đặt bảo mật</h1>
        <p className="text-slate-500 font-medium italic">Quản lý mật khẩu, phiên đăng nhập và bảo mật nâng cao</p>
      </div>

      {status && (
        <Alert type={status.type} className="rounded-2xl shadow-lg animate-in fade-in" onClose={() => setStatus(null)}>
          {status.message}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Change Password Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full">
          <div className="bg-slate-900 p-8 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">🔐</div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Đổi mật khẩu</h2>
              <p className="text-blue-200/60 text-sm font-medium">Thay đổi mật khẩu tài khoản</p>
            </div>
          </div>

          <div className="p-8 flex-1">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1 ml-2 border-l-4 border-blue-500">Mật khẩu hiện tại</label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-slate-50/50 border-slate-200 focus:bg-white rounded-2xl !py-4"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1 ml-2 border-l-4 border-indigo-500">Mật khẩu mới</label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu cực mạnh"
                  className="bg-slate-50/50 border-slate-200 focus:bg-white rounded-2xl !py-4"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1 ml-2 border-l-4 border-indigo-500">Xác nhận mật khẩu</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Xác nhận lại mật khẩu"
                  className="bg-slate-50/50 border-slate-200 focus:bg-white rounded-2xl !py-4"
                />
              </div>

              <div className="pt-4">
                <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full justify-center !py-4 text-sm font-bold shadow-xl shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-widest"
                    loading={loading}
                >
                    Xác nhận đổi mật khẩu
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* 2FA Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full">
            <div className="bg-indigo-900 p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20">📱</div>
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Xác thực 2 lớp</h2>
                    <p className="text-indigo-200/60 text-sm font-medium">Thêm một lớp bảo mật phụ</p>
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col justify-center">
                {!is2FAEnabled && !setupStep && (
                    <div className="text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-5xl opacity-50">🛡️</div>
                        <h3 className="text-lg font-bold text-slate-700">Tài khoản chưa được bảo vệ bằng 2FA</h3>
                        <p className="text-sm text-slate-500 italic max-w-xs mx-auto text-balance">Sử dụng Authenticator app để quét mã bảo mật.</p>
                        <Button 
                            variant="primary" 
                            className="bg-indigo-600 hover:bg-indigo-700 w-full justify-center !py-4 rounded-xl shadow-lg shadow-indigo-500/20 uppercase tracking-widest font-black"
                            onClick={handleSetup2FA}
                            loading={loading}
                        >
                            Kích hoạt ngay 🚀
                        </Button>
                    </div>
                )}

                {setupStep === 'verify' && qrCodeData && (
                    <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
                        <h3 className="font-bold text-slate-700 uppercase tracking-widest text-xs">Quét mã QR bằng App</h3>
                        <div className="bg-white p-4 inline-block border-4 border-slate-100 rounded-3xl shadow-inner mx-auto">
                            <img src={qrCodeData} alt="QR Code 2FA" className="w-40 h-40" />
                        </div>
                        <form onSubmit={handleVerify2FA} className="space-y-4 max-w-[200px] mx-auto">
                            <Input
                                id="2fa-code"
                                type="text"
                                maxLength="6"
                                placeholder="000000"
                                value={twoFACode}
                                onChange={(e) => setTwoFACode(e.target.value)}
                                className="text-center text-2xl font-mono !py-4 rounded-2xl bg-indigo-50/50 border-indigo-200"
                            />
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-full justify-center py-4 rounded-2xl bg-indigo-600 font-bold"
                                loading={loading}
                            >
                                Xác nhận
                            </Button>
                            <button type="button" className="text-[10px] text-slate-400 font-bold hover:text-slate-600 uppercase" onClick={() => setSetupStep(null)}>Hủy bỏ</button>
                        </form>
                    </div>
                )}

                {is2FAEnabled && (
                    <div className="text-center space-y-6 animate-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-5xl">✅</div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Xác thực 2 lớp: BẬT</h3>
                        <p className="text-xs text-green-600 font-bold italic px-8">Tài khoản của bạn đang được bảo vệ an toàn.</p>
                        <div className="pt-6">
                            <Button 
                                variant="outline" 
                                className="w-full justify-center !py-3 !text-red-500 hover:!bg-red-500 hover:!text-white border-red-200 text-xs font-black uppercase"
                                onClick={handleDisable2FA}
                                loading={loading}
                            >
                                Tắt 2FA
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Sessions Management Card */}
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-800 p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10">💻</div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Quản lý phiên hoạt động</h2>
              <p className="text-slate-400 text-sm font-medium italic">Các thiết bị hiện đang đăng nhập vào tài khoản</p>
            </div>
          </div>
          <button onClick={fetchSessions} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white border border-white/10 text-xs font-bold px-4 uppercase tracking-widest">Làm mới</button>
        </div>

        <div className="p-8">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 italic text-slate-400 text-xs uppercase tracking-[0.2em]">
                            <th className="pb-4 px-4 font-black">Thiết bị / Trình duyệt</th>
                            <th className="pb-4 px-4 font-black">Địa chỉ IP</th>
                            <th className="pb-4 px-4 font-black">Đăng nhập lúc</th>
                            <th className="pb-4 px-4 text-center font-black">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {sessions.map((session) => {
                            const isCurrent = localStorage.getItem('refreshToken') === session.token;
                            return (
                                <tr key={session._id} className={`group hover:bg-slate-50/50 transition-colors ${isCurrent ? 'bg-blue-50/30' : ''}`}>
                                    <td className="py-5 px-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">{session.userAgent?.includes('Mobi') ? '📱' : '💻'}</div>
                                            <div>
                                                <p className="font-bold text-slate-700 text-xs truncate max-w-[200px]">{session.userAgent || 'Thiết bị không xác định'}</p>
                                                {isCurrent && <span className="text-[10px] bg-blue-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-widest mt-1 inline-block">Phiên này</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 font-mono text-xs text-slate-500">{session.ip || '---'}</td>
                                    <td className="py-5 px-4">
                                        <p className="text-xs font-bold text-slate-600">{new Date(session.createdAt).toLocaleDateString('vi-VN')}</p>
                                    </td>
                                    <td className="py-5 px-4 text-center">
                                        {!isCurrent && (
                                            <button 
                                                onClick={() => handleRevokeSession(session._id)}
                                                className="px-4 py-2 bg-red-50 text-red-500 text-[10px] font-black rounded-lg hover:bg-red-500 hover:text-white transition-all border border-red-100 opacity-60 group-hover:opacity-100 uppercase"
                                            >
                                                Tắt phiên
                                            </button>
                                        )}
                                        {isCurrent && <span className="text-xs text-blue-400 font-bold italic opacity-40">N/A</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;
