const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const config = require('../config');
const { aboneDB, counterDB } = require('../database');
const { 
    createTotalAboneEmbed, 
    createTopSubscribersEmbed,
    createTotalAboneCanvas,
    createTopSubscribersCanvas
} = require('../utils/imageGenerator');

module.exports = {
    name: 'toplam',
    description: 'Sunucudaki toplam abone rolü verilmiş kullanıcı sayısını gösterir.',
    async execute(message, args) {
        try {
            // @guild
            const loadingMsg = await message.channel.send('📊 İstatistikler hesaplanıyor...');
            
            // @guild
            const toplamAbone = await aboneDB.countAbones(message.guild.id);
            
            // @guild
            const aboneRolID = config.aboneRolID;
            if (!aboneRolID) {
                await loadingMsg.delete();
                return message.reply(config.mesajlar.rolyok);
            }
            
            const rolluUyeSayisi = message.guild.roles.cache.get(aboneRolID)?.members.size || 0;
            
            // @guild
            const allCounters = await counterDB.getAllCounters(message.guild.id);
            const top5 = allCounters
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            
            try {
                // @guild
                const totalBuffer = await createTotalAboneCanvas(
                    toplamAbone,
                    rolluUyeSayisi,
                    message.guild
                );
                
                // @guild
                const totalAttachment = new AttachmentBuilder(totalBuffer, { name: 'toplam-stat.png' });
                
                // @guild
                await loadingMsg.delete();
                
                // @guild
                await message.channel.send({ files: [totalAttachment] });
                
                // @guild
                if (allCounters.length > 0) {
                    // @guild
                    const loadingMsg2 = await message.channel.send('🏆 En iyi 5 yetkili hazırlanıyor...');
                    
                    try {
                        // @guild
                        const topBuffer = await createTopSubscribersCanvas(
                            top5,
                            message.guild
                        );
                        
                        // @guild
                        const topAttachment = new AttachmentBuilder(topBuffer, { name: 'top-stat.png' });
                        
                        // @guild
                        await loadingMsg2.delete();
                        
                        // @guild
                        await message.channel.send({ files: [topAttachment] });
                    } catch (canvasError) {
                        console.error('Top 5 canvas hatası:', canvasError);
                        
                        // @guild
                        const topEmbed = createTopSubscribersEmbed(
                            top5,
                            message.guild
                        );
                        
                        await loadingMsg2.delete();
                        message.channel.send({ embeds: [topEmbed] });
                    }
                }
            } catch (canvasError) {
                console.error('Toplam canvas hatası:', canvasError);
                
                // @guild
                const totalEmbed = createTotalAboneEmbed(
                    toplamAbone,
                    rolluUyeSayisi,
                    message.guild
                );
                
                const topEmbed = createTopSubscribersEmbed(
                    top5,
                    message.guild
                );
                
                await loadingMsg.delete();
                await message.channel.send({ embeds: [totalEmbed] });
                
                // @guild
                if (allCounters.length > 0) {
                    setTimeout(() => {
                        message.channel.send({ embeds: [topEmbed] });
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Toplam abone istatistik hatası:', error);
            message.reply('❌ Bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
        }
    }
}; 