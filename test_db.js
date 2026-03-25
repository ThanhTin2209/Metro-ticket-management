console.log('Testing node...');
const mongoose = require('mongoose');
console.log('Mongoose required');
try {
  console.log('Connecting...');
  // Use a timeout
  mongoose.connect('mongodb://127.0.0.1:27017/node_auth_db', { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('Connected!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Connection error:', err);
      process.exit(1);
    });
} catch (e) {
  console.error('Catch error:', e);
}
