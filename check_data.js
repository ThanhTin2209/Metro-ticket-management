const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const Line = require('../backend/src/models/line.model');
const Station = require('../backend/src/models/station.model');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const lines = await Line.find();
    const stations = await Station.find();
    console.log('Lines:', JSON.stringify(lines, null, 2));
    console.log('Stations:', JSON.stringify(stations, null, 2));
    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
  }
}

checkData();
