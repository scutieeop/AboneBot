const mongoose = require('mongoose');

const aboneSchema = new mongoose.Schema({
    userID: { type: String, required: true },
    yetkiliID: { type: String, required: true },
    tarih: { type: Date, default: Date.now },
    sunucuID: { type: String, required: true }
});

module.exports = mongoose.model('Abone', aboneSchema); 