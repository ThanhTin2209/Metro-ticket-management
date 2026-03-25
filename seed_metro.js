const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const Line = require('./backend/src/models/line.model');
const Station = require('./backend/src/models/station.model');

const line1 = {
  name: 'Tuyến số 1: Bến Thành - Suối Tiên',
  code: 'L1',
  color: '#3B82F6',
  status: 'active'
};

const line2 = {
  name: 'Tuyến số 2: Bến Thành - Tham Lương',
  code: 'L2',
  color: '#F59E0B',
  status: 'active'
};

const l1Stations = [
  { name: 'Bến Thành', code: 'L1-01', location: { lat: 10.7712, lng: 106.6974 }, facilities: ['Toilet', 'ATM', 'Elevator'] },
  { name: 'Nhà hát Thành phố', code: 'L1-02', location: { lat: 10.7766, lng: 106.7009 }, facilities: ['Toilet', 'ATM'] },
  { name: 'Ba Son', code: 'L1-03', location: { lat: 10.7836, lng: 106.7058 }, facilities: ['Toilet', 'Elevator'] },
  { name: 'Văn Thánh', code: 'L1-04', location: { lat: 10.7963, lng: 106.7145 }, facilities: [] },
  { name: 'Tân Cảng', code: 'L1-05', location: { lat: 10.7989, lng: 106.7214 }, facilities: ['ATM'] },
  { name: 'Thảo Điền', code: 'L1-06', location: { lat: 10.8016, lng: 106.7369 }, facilities: ['Toilet'] },
  { name: 'An Phú', code: 'L1-07', location: { lat: 10.8033, lng: 106.7458 }, facilities: ['ATM'] },
  { name: 'Rạch Chiếc', code: 'L1-08', location: { lat: 10.8122, lng: 106.7578 }, facilities: [] },
  { name: 'Phước Long', code: 'L1-09', location: { lat: 10.8242, lng: 106.7667 }, facilities: ['Toilet'] },
  { name: 'Bình Thái', code: 'L1-10', location: { lat: 10.8351, lng: 106.7742 }, facilities: ['ATM'] },
  { name: 'Thủ Đức', code: 'L1-11', location: { lat: 10.8465, lng: 106.7816 }, facilities: ['Toilet', 'ATM', 'Elevator'] },
  { name: 'Khu Công nghệ cao', code: 'L1-12', location: { lat: 10.8579, lng: 106.7905 }, facilities: ['Elevator'] },
  { name: 'Đại học Quốc gia', code: 'L1-13', location: { lat: 10.8693, lng: 106.8009 }, facilities: ['Toilet', 'ATM'] },
  { name: 'Bến xe Suối Tiên', code: 'L1-14', location: { lat: 10.8797, lng: 106.8118 }, facilities: ['Toilet', 'ATM', 'Elevator'] }
];

const l2Stations = [
  { name: 'Tham Lương', code: 'L2-01', location: { lat: 10.8227, lng: 106.6200 }, facilities: ['Toilet', 'Elevator'], status: 'maintenance' },
  { name: 'Tân Bình', code: 'L2-02', location: { lat: 10.8100, lng: 106.6300 }, facilities: ['ATM'], status: 'maintenance' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data
    await Line.deleteMany({});
    await Station.deleteMany({});
    
    const dbL1 = await Line.create(line1);
    const dbL2 = await Line.create(line2);
    
    console.log('Lines created');
    
    for (const s of l1Stations) {
      const station = await Station.create({ ...s, lines: [dbL1._id] });
      dbL1.stations.push(station._id);
    }
    await dbL1.save();
    
    for (const s of l2Stations) {
      const station = await Station.create({ ...s, lines: [dbL2._id] });
      dbL2.stations.push(station._id);
    }
    await dbL2.save();
    
    console.log('Stations created and linked');
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
