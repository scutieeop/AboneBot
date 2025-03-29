const { EmbedBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
    name: 'yardım',
    description: 'Botun komutları hakkında bilgi verir.',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setColor(config.embedRenk)
            .setTitle('🤖 Abone Bot v2.0 - Yardım Menüsü')
            .setDescription('Aşağıda botun tüm komutlarını görebilirsiniz:')
            .addFields(
                { 
                    name: '👤 Abone Komutları',
                    value: 
                        '`!abone @kullanıcı` - Etiketlenen kullanıcıya abone rolü verir.\n' +
                        '`!aboneal @kullanıcı` - Etiketlenen kullanıcıdan abone rolünü alır.',
                    inline: false 
                },
                { 
                    name: '📊 İstatistik Komutları',
                    value: 
                        '`!abonestat [@kullanıcı]` - Belirtilen kullanıcının abone istatistiklerini gösterir.\n' +
                        '`!toplam` - Sunucudaki toplam abone istatistiklerini gösterir.', 
                    inline: false 
                },
                { 
                    name: '⚙️ Ayar Komutları (Yönetici)',
                    value: 
                        '`!aboneayar` - Ayar menüsünü gösterir.\n' +
                        '`!aboneayar abonerol @rol` - Abone rolünü ayarlar.\n' + 
                        '`!aboneayar yetkilirol @rol` - Yetkili rolünü ayarlar.\n' +
                        '`!aboneayar logkanal #kanal` - Log kanalını ayarlar.\n' +
                        '`!aboneayar onaykanal #kanal` - Görsel doğrulama kanalını ayarlar.\n' +
                        '`!aboneayar ocr aç/kapat` - Görsel doğrulama sistemini açar/kapatır.\n' +
                        '`!sıfırla` - Sunucunun veritabanı verilerini sıfırlar.',
                    inline: false 
                }
            )
            .addFields({
                name: '📷 Görsel Doğrulama Sistemi',
                value: 'Ayarlanan onay kanalına abone olduğunuzu gösteren bir ekran görüntüsü atarak otomatik olarak abone rolü alabilirsiniz. Sistem, görseli analiz ederek abone olup olmadığınızı kontrol eder. Son videolara abonelik geçerli değildir.',
                inline: false
            })
            .setFooter({ text: 'Abone Bot v2.0 • Gelişmiş Özellikler' })
            .setTimestamp();
            
        message.channel.send({ embeds: [embed] });
    }
}; 