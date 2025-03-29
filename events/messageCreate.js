const config = require('../config');
const { channelDB, aboneDB, counterDB, youtubeDB, serverSettingsDB } = require('../database');
const imageVerifier = require('../utils/imageVerification');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        // @guild
        if (message.author.bot || !message.guild) return;
        
        // @guild
        if (config.ocr.enabled && message.attachments.size > 0) {
            const verificationChannelId = await channelDB.getVerificationChannel(message.guild.id);
            
            if (verificationChannelId && message.channel.id === verificationChannelId) {
                await handleImageVerification(message, client);
                return;
            }
        }
        
        // @guild
        if (!message.content.startsWith(config.prefix)) return;
        
        // @guild
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // @guild
        const command = client.commands.get(commandName);
        
        if (!command) return;
        
        try {
            // @guild
            await command.execute(message, args);
        } catch (error) {
            console.error(`Komut çalıştırma hatası: ${error}`);
            message.reply('❌ Komut çalıştırılırken bir hata oluştu!');
        }
    }
};

// @guild
async function handleImageVerification(message, client) {
    try {
        // @guild
        const serverSettings = await serverSettingsDB.getSettings(message.guild.id);
        const aboneRolID = serverSettings.aboneRolID;
        const logKanalID = serverSettings.logKanalID;
        
        // @guild
        if (!aboneRolID) {
            return message.reply(config.mesajlar.rolyok);
        }
        
        // @guild
        if (message.member.roles.cache.has(aboneRolID)) {
            return message.reply(config.mesajlar.zatenRolVar);
        }
        
        // @guild
        const attachment = message.attachments.first();
        
        // @guild
        if (!attachment.contentType || !attachment.contentType.startsWith('image')) {
            return message.reply(config.mesajlar.gorselDogrulama.formatHatali);
        }
        
        // @guild
        const channelInfo = await youtubeDB.getServerChannel(message.guild.id);
        
        // @guild
        let infoMsg = null;
        try {
            if (channelInfo && channelInfo.ad) {
                infoMsg = await message.channel.send(`ℹ️ Görsel doğrulanırken **${channelInfo.ad}** kanalına abone olup olmadığınız kontrol edilecek.`);
            }
        } catch (error) {
            console.error('Bilgi mesajı gönderme hatası:', error);
        }
        
        // @guild
        let loadingMsg = null;
        try {
            loadingMsg = await message.channel.send('🔍 Görsel doğrulanıyor, lütfen bekleyin...');
        } catch (error) {
            console.error('Yükleniyor mesajı gönderme hatası:', error);
        }
        
        try {
            console.log(`🖼️ Kullanıcı ${message.author.tag} görsel yükledi, doğrulama başlıyor...`);
            
            // @guild
            const tempFilePath = await imageVerifier.downloadImage(attachment.url);
            if (!tempFilePath) {
                if (loadingMsg) await loadingMsg.delete().catch(err => console.error('Yükleniyor mesajı silme hatası:', err));
                return message.reply('❌ Görsel indirilemedi. Lütfen geçerli bir resim dosyası yükleyin.');
            }
            
            // @guild
            console.log(`📑 Görsel OCR ile işleniyor...`);
            const extractedText = await imageVerifier.extractText(tempFilePath);
            
            if (!extractedText || extractedText.trim().length < 5) {
                if (loadingMsg) await loadingMsg.delete().catch(err => console.error('Yükleniyor mesajı silme hatası:', err));
                return message.reply('❌ Görselden metin çıkarılamadı. Lütfen daha net bir ekran görüntüsü yükleyin.');
            }
            
            // @guild
            console.log(`📝 Çıkarılan metin: ${extractedText.substring(0, 100).replace(/\n/g, ' ')}...`);
            
            // @guild
            console.log(`🔎 Abonelik doğrulama işlemi başlıyor...`);
            const result = await imageVerifier.verifySubscription(extractedText, channelInfo);
            
            // @guild
            if (loadingMsg) {
                try {
                    await loadingMsg.delete();
                } catch (error) {
                    console.error('Yükleniyor mesajı silme hatası:', error);
                }
            }
            
            if (result.success) {
                console.log(`✅ Kullanıcı ${message.author.tag} için abonelik doğrulandı!`);
                try {
                    // @guild
                    await message.member.roles.add(aboneRolID);
                    
                    // @guild
                    await aboneDB.addAbone(message.author.id, client.user.id, message.guild.id);
                    
                    // @guild
                    const embed = new EmbedBuilder()
                        .setColor(config.embedRenk)
                        .setTitle('✅ Abone Rolü Verildi')
                        .setDescription(config.mesajlar.gorselDogrulama.basarili)
                        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                        .addFields(
                            { name: 'Kullanıcı', value: message.author.toString(), inline: true },
                            { name: 'Tarih', value: new Date().toLocaleDateString('tr-TR'), inline: true }
                        )
                        .setTimestamp();
                    
                    // @guild
                    if (channelInfo && channelInfo.ad) {
                        embed.addFields({ name: 'YouTube Kanalı', value: channelInfo.ad, inline: true });
                    }
                        
                    message.reply({ embeds: [embed] });
                    
                    // @guild
                    if (logKanalID) {
                        const logChannel = message.guild.channels.cache.get(logKanalID);
                        if (logChannel) {
                            embed.setDescription(`✅ **${message.author.tag}** kullanıcısına görsel doğrulama ile abone rolü verildi!`);
                            logChannel.send({ embeds: [embed] });
                        }
                    }
                } catch (roleError) {
                    console.error('Rol verme hatası:', roleError);
                    message.reply('❌ Rol verme işlemi başarısız oldu. Bot\'un yeterli yetkisi olmayabilir. Lütfen sunucu yöneticisine başvurun.');
                }
            } else {
                console.log(`❌ Kullanıcı ${message.author.tag} için abonelik doğrulama başarısız: ${result.error}`);
                
                // @guild
                let hataAciklamasi = result.error || 'Abonelik doğrulanamadı.';
                
                // @guild
                let ekBilgi = '';
                
                // @guild
                if (extractedText.toLowerCase().includes('olmak için ne')) {
                    ekBilgi = '💡 **İpucu:** Gönderdiğiniz görüntü "Abone olmak için ne yapmalıyım" şeklindeki bir mesaj içeriyor. Bu ekran abonelik göstergesi değildir. Lütfen "**Abone olundu**" yazısının göründüğü bir ekran görüntüsü gönderin.';
                }
                
                // @guild
                if (hataAciklamasi.includes('Belirtilen YouTube kanalına') && channelInfo && channelInfo.ad) {
                    hataAciklamasi = config.mesajlar.gorselDogrulama.yanlisDosya.replace('{kanal}', channelInfo.ad);
                    ekBilgi = config.mesajlar.gorselDogrulama.ipucu.replace('{kanal}', channelInfo.ad);
                }
                
                // @guild
                if (hataAciklamasi.includes('Abonelik durumu doğrulanamadı') && channelInfo) {
                    ekBilgi = config.mesajlar.gorselDogrulama.yenidenDene.replace('{kanal}', channelInfo.ad);
                }
                
                // @guild
                if (!ekBilgi && extractedText) {
                    const cleanedText = extractedText.toLowerCase().replace(/\s+/g, ' ').trim();
                    
                    // @guild
                    if (cleanedText.length < 50) {
                        ekBilgi = '💡 **İpucu:** Gönderdiğiniz görüntüden çok az metin çıkarılabildi. Daha net bir ekran görüntüsü yükleyin.';
                    }
                    // @guild
                    else if (!cleanedText.includes('abone') && !cleanedText.includes('subscribe')) {
                        ekBilgi = '💡 **İpucu:** Gönderdiğiniz görüntüde "Abone" kelimesi tespit edilemedi. "Abone olundu" yazısının görünür olduğu bir ekran görüntüsü gönderin.';
                    }
                }
                
                // @guild
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Doğrulama Başarısız')
                    .setDescription(hataAciklamasi)
                    .setTimestamp();
                    
                // @guild
                if (ekBilgi) {
                    embed.addFields({ name: 'Yardım', value: ekBilgi });
                }
                    
                message.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Görsel doğrulama hatası:', error);
            
            // @guild
            if (loadingMsg) {
                try {
                    await loadingMsg.delete();
                } catch (deleteError) {
                    console.error('Yükleniyor mesajı silme hatası:', deleteError);
                }
            }
            
            message.reply('❌ Görsel analiz edilirken bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
        }
    } catch (outerError) {
        console.error('Görsel doğrulama işlemi genel hatası:', outerError);
        message.reply('❌ İşlem sırasında beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
} 