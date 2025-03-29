const fs = require('fs-extra');
const path = require('path');

// @guild
const DB_FOLDER = path.join(__dirname, 'data');
const ABONE_DB = path.join(DB_FOLDER, 'aboneler.json');
const COUNTER_DB = path.join(DB_FOLDER, 'counters.json');
const CHANNEL_DB = path.join(DB_FOLDER, 'channels.json');
const YOUTUBE_DB = path.join(DB_FOLDER, 'youtube.json');
const SETTINGS_DB = path.join(DB_FOLDER, 'serverSettings.json');

// @guild
async function connectToDatabase() {
    try {
        // @guild
        await fs.ensureDir(DB_FOLDER);
        
        // @guild
        if (!await fs.pathExists(ABONE_DB)) {
            await fs.writeJson(ABONE_DB, { sunucular: [] });
        }
        
        // @guild
        if (!await fs.pathExists(COUNTER_DB)) {
            await fs.writeJson(COUNTER_DB, { sunucular: [] });
        }
        
        // @guild
        if (!await fs.pathExists(CHANNEL_DB)) {
            await fs.writeJson(CHANNEL_DB, { sunucular: [] });
        }
        
        // @guild
        if (!await fs.pathExists(YOUTUBE_DB)) {
            await fs.writeJson(YOUTUBE_DB, { sunucular: [] });
        }
        
        // @guild
        if (!await fs.pathExists(SETTINGS_DB)) {
            await fs.writeJson(SETTINGS_DB, { sunucular: [] });
        }
        
        console.log('✅ JSON veritabanı dosyaları başarıyla kontrol edildi/oluşturuldu!');
        return true;
    } catch (error) {
        console.error('❌ JSON veritabanı hazırlama hatası:', error);
        return false;
    }
}

// @guild
const aboneDB = {
    // @guild
    async addAbone(userID, yetkiliID, sunucuID) {
        try {
            const db = await fs.readJson(ABONE_DB);
            
            // sunucuID'ye ait kayıt var mı kontrol et
            let sunucu = db.sunucular.find(s => s.id === sunucuID);
            
            if (!sunucu) {
                // Sunucu kaydı yoksa oluştur
                sunucu = {
                    id: sunucuID,
                    aboneler: []
                };
                db.sunucular.push(sunucu);
            }
            
            // Sunucunun aboneler listesine yeni abone ekle
            sunucu.aboneler.push({
                userID,
                yetkiliID,
                tarih: Date.now()
            });
            
            await fs.writeJson(ABONE_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Abone ekleme hatası:', error);
            return false;
        }
    },
    
    // @guild
    async removeAbone(userID, sunucuID) {
        try {
            const db = await fs.readJson(ABONE_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.aboneler) return true;
            
            // Belirtilen kullanıcıyı aboneler listesinden çıkar
            sunucu.aboneler = sunucu.aboneler.filter(abone => abone.userID !== userID);
            
            await fs.writeJson(ABONE_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Abone silme hatası:', error);
            return false;
        }
    },
    
    // @guild
    async checkAbone(userID, sunucuID) {
        try {
            const db = await fs.readJson(ABONE_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.aboneler) return false;
            
            // Kullanıcı abone mi kontrol et
            return sunucu.aboneler.some(abone => abone.userID === userID);
        } catch (error) {
            console.error('Abone kontrol hatası:', error);
            return false;
        }
    },
    
    // @guild
    async countAbones(sunucuID) {
        try {
            const db = await fs.readJson(ABONE_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.aboneler) return 0;
            
            // Abone sayısını döndür
            return sunucu.aboneler.length;
        } catch (error) {
            console.error('Abone sayma hatası:', error);
            return 0;
        }
    },
    
    // @guild
    async resetSubscribers(sunucuID) {
        try {
            const db = await fs.readJson(ABONE_DB);
            
            // sunucuID'ye ait sunucuyu diziden çıkar
            db.sunucular = db.sunucular.filter(s => s.id !== sunucuID);
            
            await fs.writeJson(ABONE_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Aboneleri sıfırlama hatası:', error);
            return false;
        }
    }
};

// @guild
const counterDB = {
    // @guild
    async incrementCounter(yetkiliID, sunucuID) {
        try {
            const db = await fs.readJson(COUNTER_DB);
            
            // sunucuID'ye ait kayıt var mı kontrol et
            let sunucu = db.sunucular.find(s => s.id === sunucuID);
            
            if (!sunucu) {
                // Sunucu kaydı yoksa oluştur
                sunucu = {
                    id: sunucuID,
                    sayaclar: []
                };
                db.sunucular.push(sunucu);
            }
            
            // Sunucunun sayaçlar dizisi yoksa oluştur
            if (!sunucu.sayaclar) {
                sunucu.sayaclar = [];
            }
            
            // Yetkilinin sayacını bul veya oluştur
            const existingCounter = sunucu.sayaclar.find(counter => counter.yetkiliID === yetkiliID);
            
            if (existingCounter) {
                existingCounter.count++;
                existingCounter.lastUpdated = Date.now();
            } else {
                sunucu.sayaclar.push({
                    yetkiliID,
                    count: 1,
                    lastUpdated: Date.now()
                });
            }
            
            await fs.writeJson(COUNTER_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Sayaç arttırma hatası:', error);
            return false;
        }
    },
    
    // @guild
    async getCounter(yetkiliID, sunucuID) {
        try {
            const db = await fs.readJson(COUNTER_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.sayaclar) return { count: 0, lastUpdated: null };
            
            // Yetkilinin sayacını bul
            const counter = sunucu.sayaclar.find(counter => counter.yetkiliID === yetkiliID);
            
            return counter || { count: 0, lastUpdated: null };
        } catch (error) {
            console.error('Sayaç getirme hatası:', error);
            return { count: 0, lastUpdated: null };
        }
    },
    
    // @guild
    async getAllCounters(sunucuID) {
        try {
            const db = await fs.readJson(COUNTER_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.sayaclar) return [];
            
            // Tüm sayaçları döndür
            return sunucu.sayaclar;
        } catch (error) {
            console.error('Tüm sayaçları getirme hatası:', error);
            return [];
        }
    },
    
    // @guild
    async resetCounters(sunucuID) {
        try {
            const db = await fs.readJson(COUNTER_DB);
            
            // sunucuID'ye ait sunucuyu diziden çıkar
            db.sunucular = db.sunucular.filter(s => s.id !== sunucuID);
            
            // @guild
            await fs.writeJson(COUNTER_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Sayaçları sıfırlama hatası:', error);
            return false;
        }
    }
};

// @guild
const channelDB = {
    // @guild
    async setVerificationChannel(sunucuID, kanalID) {
        try {
            const db = await fs.readJson(CHANNEL_DB);
            
            // sunucuID'ye ait kayıt var mı kontrol et
            let sunucu = db.sunucular.find(s => s.id === sunucuID);
            
            if (!sunucu) {
                // Sunucu kaydı yoksa oluştur
                sunucu = {
                    id: sunucuID,
                    kanallar: {}
                };
                db.sunucular.push(sunucu);
            }
            
            // Sunucunun kanallar nesnesi yoksa oluştur
            if (!sunucu.kanallar) {
                sunucu.kanallar = {};
            }
            
            // Doğrulama kanalını ayarla
            sunucu.kanallar.verificationChannelID = kanalID;
            
            await fs.writeJson(CHANNEL_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Onay kanalı ayarlama hatası:', error);
            return false;
        }
    },
    
    // @guild
    async getVerificationChannel(sunucuID) {
        try {
            const db = await fs.readJson(CHANNEL_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.kanallar) return null;
            
            // Doğrulama kanalını döndür
            return sunucu.kanallar.verificationChannelID || null;
        } catch (error) {
            console.error('Onay kanalını getirme hatası:', error);
            return null;
        }
    },
    
    // @guild
    async resetVerificationChannel(sunucuID) {
        try {
            const db = await fs.readJson(CHANNEL_DB);
            
            // sunucuID'ye ait sunucuyu diziden çıkar
            db.sunucular = db.sunucular.filter(s => s.id !== sunucuID);
            
            await fs.writeJson(CHANNEL_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Doğrulama kanalını sıfırlama hatası:', error);
            return false;
        }
    }
};

// @guild
const youtubeDB = {
    // @guild
    async addChannel(channelInfo, sunucuID) {
        try {
            const db = await fs.readJson(YOUTUBE_DB);
            
            // sunucuID'ye ait kayıt var mı kontrol et
            let sunucu = db.sunucular.find(s => s.id === sunucuID);
            
            if (!sunucu) {
                // Sunucu kaydı yoksa oluştur
                sunucu = {
                    id: sunucuID,
                    youtube: {
                        kanallar: [],
                        aktifKanal: null
                    }
                };
                db.sunucular.push(sunucu);
            }
            
            // Sunucunun youtube nesnesi yoksa oluştur
            if (!sunucu.youtube) {
                sunucu.youtube = {
                    kanallar: [],
                    aktifKanal: null
                };
            }
            
            // Sunucunun youtube.kanallar dizisi yoksa oluştur
            if (!sunucu.youtube.kanallar) {
                sunucu.youtube.kanallar = [];
            }
            
            // Kanal zaten var mı kontrol et
            const existingChannel = sunucu.youtube.kanallar.find(channel => 
                channel.id === channelInfo.id
            );
            
            if (existingChannel) {
                // Kanal bilgilerini güncelle
                Object.assign(existingChannel, channelInfo);
            } else {
                // Yeni kanalı ekle
                sunucu.youtube.kanallar.push(channelInfo);
            }
            
            // Aktif kanal ID'si yoksa, yeni eklenen kanalı aktif kanal yap
            if (!sunucu.youtube.aktifKanal) {
                sunucu.youtube.aktifKanal = channelInfo.id;
            }
            
            await fs.writeJson(YOUTUBE_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('YouTube kanalı ekleme hatası:', error);
            return false;
        }
    },
    
    // @guild
    async getChannel(channelId, sunucuID) {
        try {
            const db = await fs.readJson(YOUTUBE_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.youtube || !sunucu.youtube.kanallar) return null;
            
            // Kanal ID'sine göre kanalı bul
            return sunucu.youtube.kanallar.find(channel => channel.id === channelId) || null;
        } catch (error) {
            console.error('YouTube kanalı getirme hatası:', error);
            return null;
        }
    },
    
    // @guild
    async getAllChannels(sunucuID) {
        try {
            const db = await fs.readJson(YOUTUBE_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.youtube || !sunucu.youtube.kanallar) return [];
            
            // Tüm kanalları döndür
            return sunucu.youtube.kanallar;
        } catch (error) {
            console.error('Tüm YouTube kanallarını getirme hatası:', error);
            return [];
        }
    },
    
    // @guild
    async setServerChannel(sunucuID, channelId) {
        try {
            const db = await fs.readJson(YOUTUBE_DB);
            
            // sunucuID'ye ait kayıt var mı kontrol et
            let sunucu = db.sunucular.find(s => s.id === sunucuID);
            
            if (!sunucu) {
                // Sunucu kaydı yoksa oluştur
                sunucu = {
                    id: sunucuID,
                    youtube: {
                        kanallar: [],
                        aktifKanal: channelId
                    }
                };
                db.sunucular.push(sunucu);
            } else {
                // Sunucunun youtube nesnesi yoksa oluştur
                if (!sunucu.youtube) {
                    sunucu.youtube = {
                        kanallar: [],
                        aktifKanal: channelId
                    };
                } else {
                    // aktifKanal değerini güncelle
                    sunucu.youtube.aktifKanal = channelId;
                }
            }
            
            await fs.writeJson(YOUTUBE_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Sunucu YouTube kanalı ayarlama hatası:', error);
            return false;
        }
    },
    
    // @guild
    async getServerChannel(sunucuID) {
        try {
            const db = await fs.readJson(YOUTUBE_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.youtube || !sunucu.youtube.aktifKanal) return null;
            
            // Aktif kanal ID'sine göre kanalı bul
            const kanalId = sunucu.youtube.aktifKanal;
            if (!kanalId) return null;
            
            // Kanallar arasında ara
            if (sunucu.youtube.kanallar) {
                return sunucu.youtube.kanallar.find(channel => channel.id === kanalId) || null;
            }
            
            return null;
        } catch (error) {
            console.error('Sunucu YouTube kanalı getirme hatası:', error);
            return null;
        }
    },
    
    // @guild
    async resetYoutubeChannels(sunucuID) {
        try {
            const db = await fs.readJson(YOUTUBE_DB);
            
            // sunucuID'ye ait sunucuyu diziden çıkar
            db.sunucular = db.sunucular.filter(s => s.id !== sunucuID);
            
            await fs.writeJson(YOUTUBE_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('YouTube kanal ayarlarını sıfırlama hatası:', error);
            return false;
        }
    },
    
    // @guild
    async removeChannel(channelId, sunucuID) {
        try {
            const db = await fs.readJson(YOUTUBE_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            if (!sunucu || !sunucu.youtube || !sunucu.youtube.kanallar) return true;
            
            // Kanalı listeden çıkar
            sunucu.youtube.kanallar = sunucu.youtube.kanallar.filter(channel => channel.id !== channelId);
            
            // Eğer aktif kanal silindiyse, aktifKanal değerini null yap
            if (sunucu.youtube.aktifKanal === channelId) {
                sunucu.youtube.aktifKanal = null;
                
                // Başka bir kanal varsa onu aktif yap
                if (sunucu.youtube.kanallar.length > 0) {
                    sunucu.youtube.aktifKanal = sunucu.youtube.kanallar[0].id;
                }
            }
            
            await fs.writeJson(YOUTUBE_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('YouTube kanalı silme hatası:', error);
            return false;
        }
    }
};

// @guild
const serverSettingsDB = {
    // @guild
    async getSettings(sunucuID) {
        try {
            const db = await fs.readJson(SETTINGS_DB);
            
            // sunucuID'ye ait kayıt bul
            const sunucu = db.sunucular.find(s => s.id === sunucuID);
            
            if (!sunucu || !sunucu.ayarlar) {
                return {
                    id: sunucuID,
                    aboneRolID: null,
                    yetkiliRolID: null,
                    logKanalID: null,
                    onayKanalID: null
                };
            }
            
            return {
                id: sunucuID,
                ...sunucu.ayarlar
            };
        } catch (error) {
            console.error('Sunucu ayarları getirme hatası:', error);
            return {
                id: sunucuID,
                aboneRolID: null,
                yetkiliRolID: null,
                logKanalID: null,
                onayKanalID: null
            };
        }
    },
    
    // @guild
    async updateSetting(sunucuID, key, value) {
        try {
            const db = await fs.readJson(SETTINGS_DB);
            
            // @guild
            let sunucu = db.sunucular.find(s => s.id === sunucuID);
            
            // @guild
            if (!sunucu) {
                sunucu = {
                    id: sunucuID,
                    ayarlar: {
                        aboneRolID: null,
                        yetkiliRolID: null,
                        logKanalID: null,
                        onayKanalID: null
                    }
                };
                db.sunucular.push(sunucu);
            }
            
            // Sunucunun ayarlar nesnesi yoksa oluştur
            if (!sunucu.ayarlar) {
                sunucu.ayarlar = {
                    aboneRolID: null,
                    yetkiliRolID: null,
                    logKanalID: null,
                    onayKanalID: null
                };
            }
            
            // @guild
            sunucu.ayarlar[key] = value;
            
            // @guild
            await fs.writeJson(SETTINGS_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error(`Sunucu ayarı (${key}) güncelleme hatası:`, error);
            return false;
        }
    },
    
    // @guild
    async setAboneRol(sunucuID, rolID) {
        return this.updateSetting(sunucuID, 'aboneRolID', rolID);
    },
    
    // @guild
    async setYetkiliRol(sunucuID, rolID) {
        return this.updateSetting(sunucuID, 'yetkiliRolID', rolID);
    },
    
    // @guild
    async setLogKanal(sunucuID, kanalID) {
        return this.updateSetting(sunucuID, 'logKanalID', kanalID);
    },
    
    // @guild
    async setOnayKanal(sunucuID, kanalID) {
        return this.updateSetting(sunucuID, 'onayKanalID', kanalID);
    },
    
    // @guild
    async getAboneRol(sunucuID) {
        const settings = await this.getSettings(sunucuID);
        return settings.aboneRolID;
    },
    
    // @guild
    async getYetkiliRol(sunucuID) {
        const settings = await this.getSettings(sunucuID);
        return settings.yetkiliRolID;
    },
    
    // @guild
    async getLogKanal(sunucuID) {
        const settings = await this.getSettings(sunucuID);
        return settings.logKanalID;
    },
    
    // @guild
    async getOnayKanal(sunucuID) {
        const settings = await this.getSettings(sunucuID);
        return settings.onayKanalID;
    },
    
    // @guild
    async resetSettings(sunucuID) {
        try {
            const db = await fs.readJson(SETTINGS_DB);
            
            // @guild
            db.sunucular = db.sunucular.filter(s => s.id !== sunucuID);
            
            // @guild
            await fs.writeJson(SETTINGS_DB, db, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Sunucu ayarlarını sıfırlama hatası:', error);
            return false;
        }
    }
};

module.exports = { 
    connectToDatabase,
    aboneDB,
    counterDB,
    channelDB,
    youtubeDB,
    serverSettingsDB,
    
    // Sunucunun tüm verilerini sıfırlamak için yardımcı fonksiyon
    async resetAllServerData(sunucuID) {
        try {
            console.log(`🗑️ ${sunucuID} sunucusu için tüm veritabanı verileri sıfırlanıyor...`);
            
            // Tüm veritabanlarını paralel olarak sıfırla
            const results = await Promise.all([
                aboneDB.resetSubscribers(sunucuID),
                counterDB.resetCounters(sunucuID),
                channelDB.resetVerificationChannel(sunucuID),
                youtubeDB.resetYoutubeChannels(sunucuID),
                serverSettingsDB.resetSettings(sunucuID)
            ]);
            
            // Sonuçları kontrol et
            const allSuccess = results.every(result => result === true);
            
            console.log(`${allSuccess ? '✅' : '⚠️'} ${sunucuID} sunucusu veritabanı sıfırlama ${allSuccess ? 'tamamen başarılı' : 'kısmen başarılı'}`);
            console.log(`📁 Veriler artık sunucuID altında gruplandırılmış yapıda tutulmaktadır.`);
            
            return allSuccess;
        } catch (error) {
            console.error(`❌ ${sunucuID} sunucusu için veritabanı sıfırlama hatası:`, error);
            return false;
        }
    }
}; 