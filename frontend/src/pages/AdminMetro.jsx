import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import adminService from '../services/admin.service';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Input from '../components/Input';
import Notification from '../components/Notification';

const AdminMetro = () => {
  const [lines, setLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal states
  const [showLineModal, setShowLineModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [editingStation, setEditingStation] = useState(null);
  
  const [lineForm, setLineForm] = useState({ name: '', code: '', color: '#3B82F6' });
  const [stationForm, setStationForm] = useState({ 
    name: '', code: '', lineId: '', 
    facilities: '', lat: 10.7, lng: 106.7 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [linesData, stationsData] = await Promise.all([
        adminService.getLines(),
        adminService.getStations()
      ]);
      setLines(linesData);
      setStations(stationsData);
    } catch (err) {
      setError("Không thể tải dữ liệu hạ tầng.");
    } finally {
      setLoading(false);
    }
  };

  const handleLineSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLine) {
         await adminService.updateLine(editingLine._id, lineForm);
         setNotification({ message: 'Cập nhật tuyến thành công!', type: 'success' });
      } else {
         await adminService.createLine(lineForm);
         setNotification({ message: 'Tạo tuyến thành công!', type: 'success' });
      }
      setShowLineModal(false);
      setEditingLine(null);
      setLineForm({ name: '', code: '', color: '#3B82F6' });
      fetchData();
    } catch (err) { setError("Lỗi lưu tuyến đường."); }
  };

  const handleStationSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...stationForm, facilities: typeof stationForm.facilities === 'string' ? stationForm.facilities.split(',').map(f => f.trim()) : stationForm.facilities };
      if (editingStation) {
         await adminService.updateStation(editingStation._id, data);
         setNotification({ message: 'Cập nhật trạm thành công!', type: 'success' });
      } else {
         await adminService.createStation(data);
         setNotification({ message: 'Tạo trạm thành công!', type: 'success' });
      }
      setShowStationModal(false);
      setEditingStation(null);
      setStationForm({ name: '', code: '', lineId: '', facilities: '', lat: 10.7, lng: 106.7 });
      fetchData();
    } catch (err) { setError("Lỗi lưu trạm dừng."); }
  };

  const handleDeleteStation = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa trạm này?")) return;
    try {
       await adminService.deleteStation(id);
       setNotification({ message: 'Đã xóa trạm dừng.', type: 'info' });
       fetchData();
    } catch (err) { setError("Lỗi xóa trạm."); }
  };

  const handleDeleteLine = async (id) => {
    if (!window.confirm("XÓA TUYẾN ĐƯỜNG sẽ ảnh hưởng đến hạ tầng. Bạn xác nhận xóa?")) return;
    try {
       await adminService.deleteLine(id);
       setNotification({ message: 'Đã xóa tuyến đường.', type: 'info' });
       fetchData();
    } catch (err) { setError("Lỗi xóa tuyến."); }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'maintenance' : 'active';
      await adminService.updateStationStatus(id, newStatus);
      setNotification({ message: 'Cập nhật trạng thái trạm thành công!', type: 'success' });
      fetchData();
    } catch (err) { setError("Lỗi cập nhật trạng thái."); }
  };

  const toggleLineStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'maintenance' : 'active';
      await adminService.updateLine(id, { status: newStatus });
      setNotification({ message: 'Cập nhật trạng thái tuyến thành công!', type: 'success' });
      fetchData();
    } catch (err) { setError("Lỗi cập nhật trạng thái tuyến."); }
  };

  const handleToggleAll = async (status) => {
    if (!window.confirm(`XÁC NHẬN NGUY HIỂM: \nBạn có chắc chắn muốn chuyển TOÀN BỘ TUYẾN VÀ TRẠM sang trạng thái [${status === 'active' ? 'Hoạt động' : 'Bảo trì'}]?`)) return;
    try {
      await adminService.toggleAllMetroStatus(status);
      setNotification({ message: 'Đã cập nhật trạng thái toàn hệ thống!', type: 'success' });
      fetchData();
    } catch (err) {
      setError("Lỗi khi chuyển trạng thái toàn hệ thống.");
    }
  };

  const openEditLine = (line) => {
    setEditingLine(line);
    setLineForm({ name: line.name, code: line.code, color: line.color });
    setShowLineModal(true);
  };

  const openEditStation = (station, lineId) => {
    setEditingStation(station);
    setStationForm({ 
      name: station.name, 
      code: station.code, 
      lineId: lineId,
      facilities: station.facilities?.join(', ') || '',
      lat: station.location?.lat || 10.7,
      lng: station.location?.lng || 106.7
    });
    setShowStationModal(true);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 mb-2 uppercase">HẠ TẦNG METRONET</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] ml-2">Quy hoạch • Tuyến đường • Trạm dừng</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner gap-1">
              <button onClick={() => handleToggleAll('active')} className="px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-black italic uppercase text-green-600 transition-all">Mở toàn bộ hệ thống</button>
              <button onClick={() => handleToggleAll('maintenance')} className="px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg text-[10px] font-black italic uppercase text-red-600 transition-all">Tắt toàn bộ hệ thống</button>
           </div>
           <Button onClick={() => { setEditingLine(null); setLineForm({name:'', code:'', color:'#3B82F6'}); setShowLineModal(true); }} variant="secondary" className="!px-6 !py-3 font-black italic shadow-lg">
             + TUYẾN MỚI
           </Button>
           <Button onClick={() => { setEditingStation(null); setStationForm({name:'', code:'', lineId:'', facilities:'', lat:10.7, lng:106.7}); setShowStationModal(true); }} variant="primary" className="!px-6 !py-3 font-black italic shadow-xl shadow-blue-500/20">
             + TRẠM MỚI
           </Button>
        </div>
      </div>

      {/* Lines Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {lines.map(line => (
          <div key={line._id} className="premium-card p-6 border-b-4 group" style={{ borderColor: line.color }}>
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{line.code}</span>
                <div className="flex gap-1">
                   <button onClick={() => openEditLine(line)} className="p-1 hover:text-blue-600">✏️</button>
                   <button onClick={() => handleDeleteLine(line._id)} className="p-1 hover:text-red-500">🗑️</button>
                </div>
             </div>
             <h3 className="text-lg font-black italic uppercase tracking-tight text-slate-800">{line.name}</h3>
             <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   {line.stations?.length || 0} TRẠM DỪNG
                </p>
                <div className="flex items-center gap-3">
                   <div 
                     onClick={() => toggleLineStatus(line._id, line.status)} 
                     className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${line.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}
                   >
                     <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${line.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${line.status === 'active' ? 'text-green-600' : 'text-slate-500'}`}>
                      {line.status === 'active' ? 'Hoạt động' : line.status === 'maintenance' ? 'Bảo trì' : 'Quy hoạch'}
                   </span>
                </div>
             </div>
          </div>
        ))}
        {lines.length === 0 && <div className="p-8 text-center text-slate-300 font-bold col-span-full uppercase">Chưa có dữ liệu tuyến đường</div>}
      </div>

      {/* Stations List By Line */}
      <div className="space-y-16">
        {lines.map(line => (
          <section key={line._id} className="space-y-8">
             <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black italic shadow-lg" style={{ backgroundColor: line.color }}>
                   {line.code[1] || 'L'}
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-slate-800">{line.name}</h2>
                <div className="flex-1 border-t border-slate-100"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stations.filter(s => s.lines.some(l => l._id === line._id)).map(s => (
                  <div key={s._id} className="premium-card p-8 group hover:border-blue-500 transition-all">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform shadow-xl">
                           🚉
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <div 
                             onClick={() => toggleStatus(s._id, s.status)}
                             className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out shadow-inner ${s.status === 'active' ? 'bg-green-500' : 'bg-red-400'}`}
                           >
                              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${s.status === 'active' ? 'translate-x-7' : 'translate-x-0'}`}></div>
                           </div>
                           <span className={`text-[9px] font-black uppercase tracking-widest ${s.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                              {s.status === 'active' ? 'Đang Hoạt Động' : 'Đang Bảo Trì'}
                           </span>
                        </div>
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 italic tracking-tight mb-1 uppercase">{s.name}</h3>
                     <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-6">{s.code}</p>
                     
                     <div className="flex gap-2 flex-wrap mb-6">
                        {(Array.isArray(s.facilities) ? s.facilities : []).map(f => (
                          <span key={f} className="p-2 bg-slate-50 rounded-lg text-xs" title={f}>
                             {f === 'Toilet' ? '🚻' : f === 'ATM' ? '🏧' : f === 'Elevator' ? '🛗' : '📍'}
                          </span>
                        ))}
                     </div>

                     <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPX: {s.location?.lat}, {s.location?.lng}</span>
                        <div className="flex gap-2">
                           <button onClick={() => openEditStation(s, line._id)} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-xs">✏️</button>
                           <button onClick={() => handleDeleteStation(s._id)} className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-xs">🗑️</button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        ))}
      </div>

      {/* Modals */}
      {showLineModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
           <div className="bg-white rounded-[32px] p-10 max-w-xl w-full shadow-2xl animate-pop-in">
              <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-8 tracking-tighter">
                {editingLine ? 'CẬP NHẬT TUYẾN ĐƯỜNG' : 'THÊM TUYẾN ĐƯỜNG MỚI'}
              </h3>
              <form onSubmit={handleLineSubmit} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tên tuyến</label>
                    <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 ring-blue-500 transition-all outline-none" placeholder="VD: Tuyến số 1" value={lineForm.name} onChange={e => setLineForm({...lineForm, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Mã hiệu</label>
                    <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 ring-blue-500 transition-all outline-none" placeholder="VD: L1" value={lineForm.code} onChange={e => setLineForm({...lineForm, code: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Màu hiển thị</label>
                    <input type="color" className="w-full h-14 rounded-2xl cursor-pointer bg-slate-50 border-none p-1" value={lineForm.color} onChange={e => setLineForm({...lineForm, color: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={() => setShowLineModal(false)} variant="secondary" className="flex-1 !py-4 uppercase font-black italic tracking-widest text-[10px]">HỦY</Button>
                    <Button type="submit" variant="primary" className="flex-1 !py-4 uppercase font-black italic tracking-widest text-[10px]">LƯU THAY ĐỔI</Button>
                 </div>
              </form>
           </div>
        </div>,
        document.body
      )}

      {showStationModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md hover:overflow-y-auto">
           <div className="bg-white rounded-[32px] p-10 max-w-2xl w-full shadow-2xl animate-pop-in my-auto">
              <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-8 tracking-tighter">
                {editingStation ? 'CẬP NHẬT TRẠM DỪNG' : 'THÊM TRẠM DỪNG MỚI'}
              </h3>
              <form onSubmit={handleStationSubmit} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tên trạm</label>
                       <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 ring-blue-500 transition-all outline-none" placeholder="VD: Bến Thành" value={stationForm.name} onChange={e => setStationForm({...stationForm, name: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Mã trạm</label>
                       <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 ring-blue-500 transition-all outline-none" placeholder="VD: L1-01" value={stationForm.code} onChange={e => setStationForm({...stationForm, code: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Phân bổ Tuyến</label>
                    <select 
                      className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 focus:ring-2 ring-blue-500 transition-all outline-none cursor-pointer"
                      value={stationForm.lineId}
                      onChange={e => setStationForm({...stationForm, lineId: e.target.value})}
                    >
                      <option value="">Chọn tuyến đường...</option>
                      {lines.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Tiện ích (phân cách dấu phẩy)</label>
                    <input className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 ring-blue-500 transition-all outline-none" placeholder="VD: Toilet, ATM, Elevator" value={stationForm.facilities} onChange={e => setStationForm({...stationForm, facilities: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Vĩ độ (Lat)</label>
                       <input type="number" step="0.0001" className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 ring-blue-500 transition-all outline-none" value={stationForm.lat} onChange={e => setStationForm({...stationForm, lat: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Kinh độ (Lng)</label>
                       <input type="number" step="0.0001" className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold text-sm text-slate-800 placeholder:text-slate-300 focus:ring-2 ring-blue-500 transition-all outline-none" value={stationForm.lng} onChange={e => setStationForm({...stationForm, lng: parseFloat(e.target.value)})} />
                    </div>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <Button type="button" onClick={() => setShowStationModal(false)} variant="secondary" className="flex-1 !py-4 uppercase font-black italic tracking-widest text-[10px]">HỦY</Button>
                    <Button type="submit" variant="primary" className="flex-1 !py-4 uppercase font-black italic tracking-widest text-[10px]">LƯU THAY ĐỔI</Button>
                 </div>
              </form>
           </div>
        </div>,
        document.body
      )}

      {error && <div className="fixed bottom-10 left-10 z-[70]"><Alert type="error" onClose={() => setError(null)}>{error}</Alert></div>}
      {notification && <Notification {...notification} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default AdminMetro;
