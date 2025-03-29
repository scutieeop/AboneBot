const { EmbedBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const config = require('../config');
const { aboneDB, counterDB, youtubeDB, serverSettingsDB, channelDB, resetAllServerData } = require('../database');
const { createDatabaseResetCanvas } = require('../utils/imageGenerator');

module.exports = {
    name: 'sıfırla',
    description: 'Sunucunun veritabanı verilerini sıfırlar. Sadece yöneticiler kullanabilir.',
    async execute(message, args) {
        // @guild
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Bu komutu kullanmak için yönetici yetkisine sahip olmalısın!');
        }

        // Kullanıcının mesajını sil
        try {
            await message.delete();
        } catch (err) {
            console.error('Komut mesajını silme hatası:', err);
        }

        // @guild
        const loadingMsg = await message.channel.send('⏳ Veritabanı sıfırlama işlemi başlatılıyor...');

        try {
            const serverID = message.guild.id;
            let successCount = 0;
            let errorCount = 0;
            const operations = [];

            // Tüm veritabanı verilerini sıfırla - Yeni yöntem
            try {
                await loadingMsg.edit('🗄️ Veritabanı verileri sıfırlanıyor...');
                
                // Önce tüm verileri tek bir çağrı ile sıfırlamayı dene
                const allReset = await resetAllServerData(serverID);
                
                if (allReset) {
                    // Tüm verilerin sıfırlanması başarılı oldu
                    successCount = 5; // 5 veritabanı işlemi
                    operations.push({ name: "Abone Listesi", success: true });
                    operations.push({ name: "Yetkili Sayaçları", success: true });
                    operations.push({ name: "Doğrulama Kanalı", success: true });
                    operations.push({ name: "YouTube Kanal Ayarları", success: true });
                    operations.push({ name: "Sunucu Ayarları", success: true });
                } else {
                    // Topluca sıfırlama başarısız oldu, her birini ayrı ayrı dene
                    await loadingMsg.edit('⚠️ Toplu sıfırlama başarısız oldu. Her veri tek tek sıfırlanıyor...');
                    
                    // Sunucu ayarlarını sıfırla
                    const serverReset = await serverSettingsDB.resetSettings(serverID);
                    if (serverReset) {
                        successCount++;
                        operations.push({ name: "Sunucu Ayarları", success: true });
                    } else {
                        errorCount++;
                        operations.push({ name: "Sunucu Ayarları", success: false });
                    }

                    // Doğrulama kanalını sıfırla
                    try {
                        const verificationReset = await channelDB.resetVerificationChannel(serverID);
                        if (verificationReset) {
                            successCount++;
                            operations.push({ name: "Doğrulama Kanalı", success: true });
                        } else {
                            errorCount++;
                            operations.push({ name: "Doğrulama Kanalı", success: false });
                        }
                    } catch (error) {
                        console.error('Doğrulama kanalı sıfırlama hatası:', error);
                        errorCount++;
                        operations.push({ name: "Doğrulama Kanalı", success: false });
                    }

                    // Abone listesini sıfırla
                    const aboneReset = await aboneDB.resetSubscribers(serverID);
                    if (aboneReset) {
                        successCount++;
                        operations.push({ name: "Abone Listesi", success: true });
                    } else {
                        errorCount++;
                        operations.push({ name: "Abone Listesi", success: false });
                    }

                    // Sayaçları sıfırla
                    const countersReset = await counterDB.resetCounters(serverID);
                    if (countersReset) {
                        successCount++;
                        operations.push({ name: "Yetkili Sayaçları", success: true });
                    } else {
                        errorCount++;
                        operations.push({ name: "Yetkili Sayaçları", success: false });
                    }

                    // YouTube kanal ayarlarını sıfırla
                    const youtubeReset = await youtubeDB.resetYoutubeChannels(serverID);
                    if (youtubeReset) {
                        successCount++;
                        operations.push({ name: "YouTube Kanal Ayarları", success: true });
                    } else {
                        errorCount++;
                        operations.push({ name: "YouTube Kanal Ayarları", success: false });
                    }
                }
            } catch (resetError) {
                console.error('Veri sıfırlama hatası:', resetError);
                errorCount = 5;
                operations.push({ name: "Tüm Veriler", success: false });
            }

            // Canvas sonucu oluştur ve gönder
            try {
                await loadingMsg.edit('✅ Sıfırlama tamamlandı! Sonuç raporu hazırlanıyor...');
                const buffer = await createDatabaseResetCanvas(message.guild, successCount, errorCount, operations);
                const attachment = new AttachmentBuilder(buffer, { name: 'db-reset.png' });
                await loadingMsg.delete().catch(err => console.error('Mesaj silme hatası:', err));
                await message.channel.send({ 
                    content: `🗑️ **${message.guild.name}** sunucusu için veritabanı sıfırlama işlemi tamamlandı!`, 
                    files: [attachment] 
                });
            } catch (err) {
                console.error('Canvas oluşturma hatası:', err);
                // Canvas oluşturulamazsa embed gönder
                const embed = new EmbedBuilder()
                    .setColor(errorCount > 0 ? '#FF5555' : '#55FF55')
                    .setTitle('🗑️ Veritabanı Sıfırlama Sonucu')
                    .setDescription(`**${message.guild.name}** sunucusu için sıfırlama işlemi tamamlandı.`)
                    .addFields(
                        { name: '✅ Başarılı İşlemler', value: `${successCount}`, inline: true },
                        { name: '❌ Başarısız İşlemler', value: `${errorCount}`, inline: true }
                    )
                    .setTimestamp();
                
                await loadingMsg.delete().catch(err => console.error('Mesaj silme hatası:', err));
                await message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Veritabanı sıfırlama hatası:', error);
            await loadingMsg.edit('❌ Veritabanı sıfırlama sırasında bir hata oluştu!');
        }
    }
}; 