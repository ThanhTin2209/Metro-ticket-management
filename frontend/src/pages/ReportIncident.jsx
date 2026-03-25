import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import metroService from '../services/metro.service';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Input from '../components/Input';
import Notification from '../components/Notification';

const ReportIncident = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: 'EQUIPMENT_FAILURE',
    severity: 'MEDIUM',
    location: '',
    description: ''
  });
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoadingHistory(true);
      const data = await metroService.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Error loading incidents:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      setResolvingId(id);
      await metroService.resolveIncident(id);
      setNotification({ message: 'Đã xác nhận xử lý sự cố thành công!', type: 'success' });
      loadIncidents();
    } catch (err) {
      setError('Lỗi khi duyệt sự cố.');
    } finally {
      setResolvingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.description) {
      return setError('Vui lòng điền đầy đủ thông tin.');
    }

    try {
      setLoading(true);
      setError(null);
      await metroService.reportIncident(formData);
      setNotification({ message: 'Báo cáo sự cố thành công! Đã thông báo tới toàn hệ thống.', type: 'success' });
      setFormData({
        type: 'EQUIPMENT_FAILURE',
        severity: 'MEDIUM',
        location: '',
        description: ''
      });
      loadIncidents();
    } catch (err) {
      setError('Lỗi khi gửi báo cáo sự cố.');
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    'LOW': 'bg-blue-100 text-blue-700 border-blue-200',
    'MEDIUM': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'HIGH': 'bg-orange-100 text-orange-700 border-orange-200',
    'CRITICAL': 'bg-red-100 text-red-700 border-red-200 animate-pulse',
  };

  const typeLabels = {
    'EQUIPMENT_FAILURE': 'Hỏng hóc thiết bị ⚙️',
    'EMERGENCY': 'Khẩn cấp 🆘',
    'SECURITY': 'An ninh 🛡️',
    'WEATHER': 'Thời tiết 🌩️',
    'OTHER': 'Khác 📁'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2 flex items-center gap-4 uppercase">
            <span className="w-12 h-12 bg-red-600 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-red-500/30 not-italic">⚠️</span>
            QUẢN LÝ & BÁO CÁO SỰ CỐ
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] ml-2">Phối hợp điều hành • Khắc phục sự cố khẩn cấp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Report Form */}
        <section className="premium-card p-10 bg-white border-b-8 border-red-600">
           <h3 className="text-xl font-black mb-8 border-b border-slate-100 pb-4 text-red-600 tracking-tight flex items-center gap-2 uppercase italic">
              <span className="text-2xl not-italic">📝</span> Gửi báo cáo mới
           </h3>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Loại sự cố</label>
                    <select 
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all text-slate-700"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                       <option value="EQUIPMENT_FAILURE">Hỏng hóc thiết bị</option>
                       <option value="EMERGENCY">Khẩn cấp</option>
                       <option value="SECURITY">An ninh</option>
                       <option value="WEATHER">Thời tiết</option>
                       <option value="OTHER">Khác</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Mức độ nguy cấp</label>
                    <select 
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all text-slate-700"
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    >
                       <option value="LOW">THẤP (LOW)</option>
                       <option value="MEDIUM">TRUNG BÌNH (MEDIUM)</option>
                       <option value="HIGH">CAO (HIGH)</option>
                       <option value="CRITICAL">NGUY CẤP (CRITICAL)</option>
                    </select>
                 </div>
              </div>

              <Input 
                id="location"
                label="Vị trí xảy ra sự cố"
                placeholder="Ví dụ: Ga Bến Thành, Tàu L1-05..."
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                icon={<span className="text-xl">📍</span>}
              />

              <div>
                 <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Mô tả sự cố chi tiết</label>
                 <textarea 
                   className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all text-slate-700 min-h-[150px]"
                   placeholder="Mô tả cụ thể vấn đề để đội kỹ thuật nắm bắt..."
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                 ></textarea>
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <Button 
                variant="primary" 
                type="submit" 
                className="w-full !py-5 justify-center !bg-red-600 font-black italic tracking-tighter uppercase text-sm animate-pop-in border-none shadow-xl shadow-red-500/20"
                loading={loading}
              >
                GỬI BÁO CÁO KHẨN CẤP 🚨
              </Button>
           </form>
        </section>

        {/* Recent Incidents History */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase flex items-center gap-2">
                 <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                 DANH SÁCH SỰ CỐ HỆ THỐNG
              </h3>
              <div className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase">Thời gian thực 🔴</div>
           </div>

           <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
              {loadingHistory ? (
                <div className="animate-pulse space-y-4">
                   {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-3xl"></div>)}
                </div>
              ) : incidents.length > 0 ? (
                incidents.map((i) => (
                  <div key={i._id} className={`premium-card p-8 bg-white hover:border-red-500 transition-all border-l-8 group cursor-pointer ${i.status === 'RESOLVED' ? 'border-green-500 opacity-80' : 'border-red-600 shadow-lg shadow-red-500/10 animate-fade-in'}`}>
                     <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4">
                           <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">
                              {i.type === 'EQUIPMENT_FAILURE' ? '⚙️' : i.type === 'EMERGENCY' ? '🆘' : '🛡️'}
                           </div>
                           <div>
                              <p className="font-black italic text-slate-800 tracking-tight uppercase leading-none mb-1">{typeLabels[i.type]}</p>
                              <p className="text-[9px] font-black italic text-slate-400 uppercase tracking-widest">{new Date(i.createdAt).toLocaleString()}</p>
                           </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest italic border shadow-sm ${severityColors[i.severity]}`}>
                           {i.severity}
                        </span>
                     </div>
                     <div className="space-y-3">
                        <div className="flex gap-2 items-center">
                           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vị trí:</span>
                           <span className="text-xs font-bold text-red-600 tracking-tight underline decoration-red-200 underline-offset-4">{i.location}</span>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                           <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                              "{i.description}"
                           </p>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                           <div className="flex gap-2 items-center text-[10px] font-bold text-slate-400 italic">
                              <span>Báo cáo bởi:</span>
                              <span className="text-slate-600 uppercase tracking-tighter">{i.reporterId?.name || 'Unknown'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              {i.status === 'RESOLVED' ? (
                                <span className="flex items-center gap-1.5 text-green-600 font-black text-[10px] uppercase tracking-widest italic bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                   <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                   ĐÃ XỬ LÝ
                                </span>
                              ) : (
                                <div className="flex flex-col gap-2 items-end">
                                  <span className="flex items-center gap-1.5 text-orange-600 font-black text-[10px] uppercase tracking-widest italic bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                                     <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></span>
                                     ĐANG ĐỢI...
                                  </span>
                                  {user?.role === 'admin' && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleResolve(i._id); }}
                                      disabled={resolvingId === i._id}
                                      className="px-4 py-1.5 bg-green-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                      {resolvingId === i._id ? 'Đang duyệt...' : 'Duyệt xử lý ✅'}
                                    </button>
                                  )}
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                   <div className="text-5xl mb-4 opacity-50">🚆</div>
                   <p className="font-black italic text-sm uppercase tracking-widest text-slate-400">Hệ thống đang ổn định ✅</p>
                   <p className="text-[10px] font-bold text-slate-300 uppercase mt-2">Không phát hiện sự cố mới nào</p>
                </div>
              )}
           </div>
        </section>
      </div>

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default ReportIncident;
