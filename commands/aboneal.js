const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { aboneDB, serverSettingsDB } = require('../database');

module.exports = {
    name: 'aboneal',
    description: 'Belirtilen kullanıcıdan abone rolünü alır.',
    async execute(message, args) {
        // @guild
        const serverSettings = await serverSettingsDB.getSettings(message.guild.id);
        const aboneRolID = serverSettings.aboneRolID;
        const yetkiliRolID = serverSettings.yetkiliRolID;
        const logKanalID = serverSettings.logKanalID;
        
        // @guild
        if (!yetkiliRolID || !message.member.roles.cache.has(yetkiliRolID)) {
            return message.reply(config.mesajlar.yetkiYok);
        }

        // @guild
        if (!aboneRolID) {
            return message.reply(config.mesajlar.rolyok);
        }

        // @guild
        const user = message.mentions.members.first();
        if (!user) {
            return message.reply(config.mesajlar.kullaniciEtiketle);
        }

        // @guild
        if (!user.roles.cache.has(aboneRolID)) {
            return message.reply(config.mesajlar.zatenRolYok);
        }

        try {
            // @guild
            await user.roles.remove(aboneRolID);

            // @guild
            await aboneDB.removeAbone(user.id, message.guild.id);

            // @guild
            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Abone Rolü Alındı')
                .setDescription(`✅ ${user.toString()} kullanıcısından abone rolü alındı!`)
                .addFields(
                    { name: 'Kullanıcı', value: user.toString(), inline: true },
                    { name: 'Yetkili', value: message.author.toString(), inline: true },
                    { name: 'Tarih', value: new Date().toLocaleDateString('tr-TR'), inline: true }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            // @guild
            if (logKanalID) {
                const logChannel = message.guild.channels.cache.get(logKanalID);
                if (logChannel) {
                    logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Abone rolü alma hatası:', error);
            message.reply('❌ Bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
        }
    }
}; 