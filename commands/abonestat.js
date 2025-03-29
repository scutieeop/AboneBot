const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const config = require('../config');
const { counterDB } = require('../database');
const { createAboneStatEmbed, createAboneStatCanvas } = require('../utils/imageGenerator');

module.exports = {
    name: 'abonestat',
    description: 'Yetkililerin verdiği abone rolü istatistiklerini gösterir.',
    async execute(message, args) {
        try {
            let user = message.mentions.users.first() || message.author;
            
            // @guild
            if (
                user.id !== message.author.id && 
                !message.member.roles.cache.has(config.yetkiliRolID)
            ) {
                return message.reply(config.mesajlar.yetkiYok);
            }

            // @guild
            const loadingMsg = await message.channel.send('📊 İstatistikler yükleniyor...');
            
            // @guild
            const stats = await counterDB.getCounter(user.id, message.guild.id);
            
            try {
                // @guild
                const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
                const buffer = await createAboneStatCanvas(user, stats, avatarURL);
                
                // @guild
                const attachment = new AttachmentBuilder(buffer, { name: 'abone-stat.png' });
                
                // @guild
                await loadingMsg.delete();
                message.channel.send({ files: [attachment] });
            } catch (canvasError) {
                console.error('Canvas hatası:', canvasError);
                
                // @guild
                const embed = createAboneStatEmbed(
                    user, 
                    stats, 
                    user.displayAvatarURL({ dynamic: true })
                );
                
                await loadingMsg.delete();
                message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Abone istatistik hatası:', error);
            message.reply('❌ Bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
        }
    }
}; 