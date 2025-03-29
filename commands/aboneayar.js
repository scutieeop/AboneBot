const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const config = require('../config');
const { channelDB, youtubeDB, serverSettingsDB } = require('../database');
const youtubeHelper = require('../utils/youtubeHelper');

module.exports = {
    name: 'aboneayar',
    description: 'Abone rol sisteminin ayarlarını yapar.',
    async execute(message, args) {
        // @guild
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Bu komutu kullanmak için yönetici yetkisine sahip olmalısın!');
        }

        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(config.embedRenk)
                .setTitle('🛠️ Abone Rol Ayarları')
                .setDescription('Aşağıdaki komutları kullanarak abone rol sistemini ayarlayabilirsiniz:')
                .addFields(
                    { name: '!aboneayar abonerol @rol', value: 'Abone rolünü ayarlar.', inline: false },
                    { name: '!aboneayar yetkilirol @rol', value: 'Abone rolünü verebilecek yetkili rolünü ayarlar.', inline: false },
                    { name: '!aboneayar logkanal #kanal', value: 'Abone rol işlemlerinin loglanacağı kanalı ayarlar.', inline: false },
                    { name: '!aboneayar onaykanal #kanal', value: 'Fotoğraf doğrulama yapılacak kanalı ayarlar.', inline: false },
                    { name: '!aboneayar ocr aç/kapat', value: 'Görsel doğrulama sistemini açar/kapatır.', inline: false },
                    { name: '!aboneayar ytkanal URL ad', value: 'Abone olunan YouTube kanalını ayarlar. Örnek: !aboneayar ytkanal https://youtube.com/c/KanalAdı "Kanal Adı"', inline: false },
                    { name: '!aboneayar ytkanal bilgi', value: 'Ayarlanan YouTube kanalı bilgilerini gösterir.', inline: false },
                    { name: '!aboneayar sıfırla', value: 'Tüm ayarları sıfırlar.', inline: false }
                )
                .setFooter({ text: 'Abone Bot v2.0 • Gelişmiş Ayarlar' })
                .setTimestamp();
                
            return message.channel.send({ embeds: [embed] });
        }

        const configPath = './config.js';
        
        switch (args[0].toLowerCase()) {
            case 'abonerol': {
                const role = message.mentions.roles.first();
                if (!role) return message.reply('❌ Lütfen bir rol etiketleyin!');
                
                // @guild
                await serverSettingsDB.setAboneRol(message.guild.id, role.id);
                
                message.channel.send(`✅ Abone rolü başarıyla ${role.toString()} olarak ayarlandı!`);
                break;
            }
            
            case 'yetkilirol': {
                const role = message.mentions.roles.first();
                if (!role) return message.reply('❌ Lütfen bir rol etiketleyin!');
                
                // @guild
                await serverSettingsDB.setYetkiliRol(message.guild.id, role.id);
                
                message.channel.send(`✅ Yetkili rolü başarıyla ${role.toString()} olarak ayarlandı!`);
                break;
            }
            
            case 'logkanal': {
                const channel = message.mentions.channels.first();
                if (!channel) return message.reply('❌ Lütfen bir kanal etiketleyin!');
                
                // @guild
                await serverSettingsDB.setLogKanal(message.guild.id, channel.id);
                
                message.channel.send(`✅ Log kanalı başarıyla ${channel.toString()} olarak ayarlandı!`);
                break;
            }
            
            case 'onaykanal': {
                const channel = message.mentions.channels.first();
                if (!channel) return message.reply('❌ Lütfen bir kanal etiketleyin!');
                
                // @guild
                await serverSettingsDB.setOnayKanal(message.guild.id, channel.id);
                await channelDB.setVerificationChannel(message.guild.id, channel.id);
                
                message.channel.send(`✅ Onay kanalı başarıyla ${channel.toString()} olarak ayarlandı! Bu kanalda gönderilen resimler otomatik olarak kontrol edilecek.`);
                break;
            }
            
            case 'ocr': {
                const option = args[1]?.toLowerCase();
                
                if (!option || (option !== 'aç' && option !== 'kapat')) {
                    return message.reply('❌ Lütfen geçerli bir seçenek belirtin! Kullanım: `!aboneayar ocr aç/kapat`');
                }
                
                const enabled = option === 'aç';
                updateOCRConfig(configPath, enabled);
                
                message.channel.send(`✅ Görsel doğrulama sistemi başarıyla ${enabled ? 'açıldı' : 'kapatıldı'}!`);
                break;
            }
            
            case 'ytkanal': {
                if (!args[1]) {
                    return message.reply('❌ Lütfen YouTube kanal URL\'si veya "bilgi" parametresi belirtin! Örnek: `!aboneayar ytkanal https://youtube.com/c/KanalAdı "Kanal Adı"' );
                }
                
                if (args[1].toLowerCase() === 'bilgi') {
                    // @guild
                    const channelInfo = await youtubeDB.getServerChannel(message.guild.id);
                    
                    if (!channelInfo) {
                        return message.reply('❌ Bu sunucu için henüz bir YouTube kanalı ayarlanmamış!');
                    }
                    
                    const embed = new EmbedBuilder()
                        .setColor(config.embedRenk)
                        .setTitle('YouTube Kanal Bilgileri')
                        .addFields(
                            { name: 'Kanal Adı', value: channelInfo.ad || 'Belirtilmemiş', inline: false },
                            { name: 'Kanal URL', value: channelInfo.url || 'Belirtilmemiş', inline: false },
                            { name: 'Kanal ID', value: channelInfo.id || 'Belirtilmemiş', inline: false }
                        )
                        .setFooter({ text: 'Abone Bot v2.0 • YouTube Kanal Ayarları' })
                        .setTimestamp();
                    
                    message.channel.send({ embeds: [embed] });
                    break;
                }
                
                // @guild
                const youtubeUrl = args[1];
                
                // @guild
                let kanalAdi = '';
                const fullMessage = message.content;
                
                // @guild
                const matches = fullMessage.match(/"([^"]*)"|'([^']*)'|`([^`]*)`/);
                if (matches) {
                    kanalAdi = matches[1] || matches[2] || matches[3] || '';
                } else if (args[2]) {
                    // @guild
                    kanalAdi = args.slice(2).join(' ');
                }
                
                // @guild
                const channelId = youtubeHelper.extractChannelId(youtubeUrl);
                
                if (!channelId) {
                    return message.reply('❌ Geçersiz YouTube kanal URL\'si! Lütfen geçerli bir YouTube kanalı URL\'si girin.');
                }
                
                if (!kanalAdi) {
                    return message.reply('❌ Lütfen kanal adı belirtin! Örnek: `!aboneayar ytkanal https://youtube.com/c/KanalAdı "Kanal Adı"' );
                }
                
                // @guild
                const channelInfo = {
                    id: channelId,
                    url: youtubeUrl,
                    ad: kanalAdi
                };
                
                // @guild
                await youtubeDB.addChannel(channelInfo, message.guild.id);
                await youtubeDB.setServerChannel(message.guild.id, channelId);
                
                message.channel.send(`✅ YouTube kanalı başarıyla **${kanalAdi}** olarak ayarlandı!`);
                break;
            }
            
            case 'sıfırla': {
                // @guild
                updateOCRConfig(configPath, false);
                
                // @guild
                await serverSettingsDB.resetSettings(message.guild.id);
                await channelDB.setVerificationChannel(message.guild.id, null);
                await youtubeDB.setServerChannel(message.guild.id, null);
                
                message.channel.send('✅ Tüm ayarlar başarıyla sıfırlandı!');
                break;
            }
            
            default:
                message.reply('❌ Geçersiz parametre! Kullanım: `!aboneayar abonerol/yetkilirol/logkanal/onaykanal/ocr/ytkanal/sıfırla`');
        }
    }
};

// @guild
function updateOCRConfig(path, enabled) {
    // @guild
    let configContent = fs.readFileSync(path, 'utf8');
    
    // @guild
    const regex = /(ocr\s*:\s*{\s*enabled\s*:\s*)(true|false)/g;
    
    // @guild
    configContent = configContent.replace(regex, `$1${enabled}`);
    
    // @guild
    fs.writeFileSync(path, configContent, 'utf8');
    
    // @guild
    config.ocr.enabled = enabled;
} 