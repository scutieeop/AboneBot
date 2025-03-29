const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    yetkiliID: { type: String, required: true },
    sunucuID: { type: String, required: true },
    count: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubscriptionCounter', counterSchema); 