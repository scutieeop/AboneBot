const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const { aboneDB, counterDB, serverSettingsDB } = require('../database');

module.exports = {
    name: 'abone',
    description: 'Belirtilen kullanıcıya abone rolü verir.',
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
        if (user.roles.cache.has(aboneRolID)) {
            return message.reply(config.mesajlar.zatenRolVar);
        }

        try {
            // @guild
            await user.roles.add(aboneRolID);

            // @guild
            await aboneDB.addAbone(user.id, message.author.id, message.guild.id);

            // @guild
            await counterDB.incrementCounter(message.author.id, message.guild.id);

            // @guild
            const embed = new EmbedBuilder()
                .setColor(config.embedRenk)
                .setTitle('Abone Rolü Verildi')
                .setDescription(config.mesajlar.aboneRolVerildi.replace('{user}', user.toString()))
                .addFields(
                    { name: 'Abone', value: user.toString(), inline: true },
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
            console.error('Abone rolü verme hatası:', error);
            message.reply('❌ Bir hata oluştu! Lütfen daha sonra tekrar deneyin.');
        }
    }
}; 