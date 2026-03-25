import React, { useState, useEffect } from 'react';
import metroService from '../services/metro.service';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Input from '../components/Input';
import Notification from '../components/Notification';

const Violations = () => {
  const [formData, setFormData] = useState({
    ticketCode: '',
    violatorName: '',
    type: 'NO_TICKET',
    severity: 'MODERATE',
    location: '',
    description: '',
    fineAmount: 0,
    evidenceImages: []
  });
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    try {
      setLoadingList(true);
      const data = await metroService.getViolations();
      setViolations(data);
    } catch (err) {
      console.error('Error loading violations:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const addEvidence = () => {
    if (tempImageUrl) {
      setFormData({
        ...formData,
        evidenceImages: [...formData.evidenceImages, tempImageUrl]
      });
      setTempImageUrl('');
    }
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    let fine = 0;
    if (type === 'NO_TICKET') fine = 200000;
    if (type === 'SMOKING') fine = 500000;
    if (type === 'EXPIRED_TICKET') fine = 100000;
    if (type === 'LITTERING') fine = 300000;
    
    setFormData({ ...formData, type, fineAmount: fine });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location || !formData.description) {
      return setError('Vui lòng điền đầy đủ vị trí và mô tả vi phạm.');
    }

    try {
      setLoading(true);
      setError(null);
      await metroService.createViolation(formData);
      setNotification({ message: 'Lập biên bản vi phạm thành công!', type: 'success' });
      setFormData({
        ticketCode: '',
        violatorName: '',
        type: 'NO_TICKET',
        severity: 'MODERATE',
        location: '',
        description: '',
        fineAmount: 200000,
        evidenceImages: []
      });
      loadViolations();
    } catch (err) {
      setError('Lỗi khi lưu biên bản vi phạm.');
    } finally {
      setLoading(false);
    }
  };

  const violationTypes = {
    'NO_TICKET': 'Không có vé 🎫',
    'EXPIRED_TICKET': 'Vé hết hạn ⏳',
    'SMOKING': 'Hút thuốc 🚭',
    'LITTERING': 'Xả rác 🚮',
    'SECURITY_BREACH': 'Vi phạm an ninh 🛡️',
    'OTHER': 'Khác 📁'
  };

  const severityStyles = {
    'LIGHT': 'bg-blue-50 text-blue-600 border-blue-100',
    'MODERATE': 'bg-orange-50 text-orange-600 border-orange-100',
    'SEVERE': 'bg-red-50 text-red-600 border-red-100 animate-pulse'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 mb-2 flex items-center gap-4 uppercase">
            <span className="w-12 h-12 bg-orange-500 rounded-3xl flex items-center justify-center text-2xl shadow-xl shadow-orange-500/30 not-italic">📝</span>
            LẬP BIÊN BẢN VI PHẠM
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.4em] ml-2">Đảm bảo trật tự • Xử lý sai phạm • Công minh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Violation Form */}
        <section className="premium-card p-10 bg-white border-b-8 border-orange-500 h-fit">
           <h3 className="text-xl font-black mb-8 border-b border-slate-100 pb-4 text-orange-600 tracking-tight flex items-center gap-2 uppercase italic">
              <span className="text-2xl not-italic">📋</span> CHI TIẾT BIÊN BẢN
           </h3>

           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input 
                   label="Họ tên người vi phạm"
                   placeholder="Nhập tên khách hàng (nếu có)"
                   value={formData.violatorName}
                   onChange={e => setFormData({...formData, violatorName: e.target.value})}
                 />
                 <Input 
                   label="Mã vé liên quan"
                   placeholder="VD: TKT-XXXX"
                   value={formData.ticketCode}
                   onChange={e => setFormData({...formData, ticketCode: e.target.value})}
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Loại hành vi</label>
                    <select 
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm"
                      value={formData.type}
                      onChange={handleTypeChange}
                    >
                       {Object.keys(violationTypes).map(k => <option key={k} value={k}>{violationTypes[k]}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Mức độ</label>
                    <select 
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-4 font-bold text-sm"
                      value={formData.severity}
                      onChange={e => setFormData({...formData, severity: e.target.value})}
                    >
                       <option value="LIGHT">NHẸ (LIGHT)</option>
                       <option value="MODERATE">TRUNG BÌNH (MODERATE)</option>
                       <option value="SEVERE">NGHIÊM TRỌNG (SEVERE)</option>
                    </select>
                 </div>
              </div>

              <Input 
                label="Vị trí vi phạm"
                placeholder="Số hiệu tàu hoặc tên nhà ga"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                 <Input 
                   label="Mức phạt (VNĐ)"
                   type="number"
                   value={formData.fineAmount}
                   onChange={e => setFormData({...formData, fineAmount: parseInt(e.target.value)})}
                 />
                 <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-[10px] font-bold text-orange-600 uppercase tracking-widest text-center">
                    Gợi ý: {formData.fineAmount.toLocaleString()} VNĐ
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">📸 BẰNG CHỨNG HÌNH ẢNH</label>
                 <div className="flex gap-2">
                    <input 
                      className="flex-1 h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 font-medium text-xs"
                      placeholder="Dán URL ảnh bằng chứng tại đây..."
                      value={tempImageUrl}
                      onChange={e => setTempImageUrl(e.target.value)}
                    />
                    <button type="button" onClick={addEvidence} className="px-6 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase">Thêm</button>
                 </div>
                 <div className="flex gap-4 flex-wrap">
                    {formData.evidenceImages.map((img, idx) => (
                      <div key={idx} className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group">
                         <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                         <button 
                           type="button" 
                           onClick={() => setFormData({...formData, evidenceImages: formData.evidenceImages.filter((_, i) => i !== idx)})}
                           className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                         >
                           Xóa
                         </button>
                      </div>
                    ))}
                    <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-2xl text-slate-300">
                       📷
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Mô tả chi tiết vi phạm</label>
                 <textarea 
                   className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 font-bold text-sm min-h-[120px]"
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                 ></textarea>
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <Button 
                variant="primary" 
                type="submit" 
                className="w-full !py-5 justify-center !bg-orange-600 font-black italic tracking-tighter uppercase text-sm shadow-xl shadow-orange-500/20"
                loading={loading}
              >
                XÁC NHẬN LẬP BIÊN BẢN 🖋️
              </Button>
           </form>
        </section>

        {/* Violations List */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black italic tracking-tighter text-slate-800 uppercase flex items-center gap-2">
                 <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                 DANH SÁCH BIÊN BẢN ĐÃ LẬP
              </h3>
              <div className="px-3 py-1 bg-white border border-slate-100 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest italic shadow-sm">Tháng hiện tại 📊</div>
           </div>

           <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 scrollbar-hide">
              {loadingList ? (
                <div className="animate-pulse space-y-4">
                   {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl"></div>)}
                </div>
              ) : violations.length > 0 ? (
                violations.map((v) => (
                  <div key={v._id} className="premium-card p-8 bg-white hover:border-orange-500 transition-all border-l-8 border-orange-500/20">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                           <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-xl">🚔</div>
                           <div>
                              <p className="font-black italic text-slate-800 tracking-tight uppercase leading-none mb-1 text-lg">{violationTypes[v.type]}</p>
                              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{v.severity} LEVEL</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(v.createdAt).toLocaleDateString()}</p>
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${severityStyles[v.severity]}`}>
                              {v.status}
                           </span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-slate-50 rounded-2xl">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Người vi phạm</p>
                           <p className="font-bold text-slate-800 text-xs">{v.violatorName}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mức phạt</p>
                            <p className="font-bold text-red-600 text-xs">{(v.fineAmount || 0).toLocaleString()} VNĐ</p>
                        </div>
                     </div>

                     <div className="flex gap-2 items-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic border-t border-slate-100 pt-4">
                        <span>Lập bởi:</span>
                        <span className="text-slate-800">{v.inspectorId?.name}</span>
                        <span className="mx-2">•</span>
                        <span>Tại:</span>
                        <span className="text-slate-800">{v.location}</span>
                     </div>
                  </div>
                ))
              ) : (
                <div className="h-48 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center text-slate-300 font-black italic uppercase text-sm tracking-widest">
                   Chưa có dữ liệu vi phạm
                </div>
              )}
           </div>
        </section>
      </div>

      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default Violations;
