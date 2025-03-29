const { ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Worker } = require('worker_threads');
const config = require('../config');
const ocrWorker = require('../utils/imageVerification');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        // @guild
        client.user.setPresence({
            activities: [
                {
                    name: `!yardım | ${client.guilds.cache.size} sunucu`,
                    type: ActivityType.Playing // @guild
                }
            ],
            status: 'online' // @guild
        });
        
        // @guild
        const tempImagesDir = path.join(__dirname, '..', 'temp', 'images');
        if (fs.existsSync(tempImagesDir)) {
            try {
                const files = fs.readdirSync(tempImagesDir);
                for (const file of files) {
                    fs.unlinkSync(path.join(tempImagesDir, file));
                }
                console.log('🧹 Geçici görsel dosyaları temizlendi!');
            } catch (error) {
                console.error('Geçici dosya temizleme hatası:', error);
            }
        }
        
        // @guild
        if (config.ocr.enabled) {
            try {
                ocrWorker.initialize();
                console.log('🔍 OCR sistemi başlatıldı!');
            } catch (error) {
                console.error('OCR başlatma hatası:', error);
            }
        }
        
        console.log(`✅ ${client.user.tag} ismiyle giriş yapıldı! ${client.guilds.cache.size} sunucuda hizmet veriliyor.`);
    },
}; 