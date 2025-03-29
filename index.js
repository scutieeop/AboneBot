const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// @guild
const { connectToDatabase } = require('./database');

// @guild
async function main() {
    try {
        // @guild
        const foldersToCheck = ['commands', 'events', 'handlers', 'utils', 'data', 'temp'];
        for (const folder of foldersToCheck) {
            if (!fs.existsSync(`./${folder}`)) {
                fs.mkdirSync(`./${folder}`);
                console.log(`✅ ${folder} klasörü oluşturuldu!`);
            }
        }

        // @guild
        if (!fs.existsSync('./temp/images')) {
            fs.mkdirSync('./temp/images', { recursive: true });
            console.log('✅ temp/images klasörü oluşturuldu!');
        }

        // @guild
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent
            ],
            allowedMentions: {
                parse: ['users', 'roles'],
                repliedUser: true
            }
        });

        client.commands = new Collection();
        client.slashCommands = new Collection();
        
        // @guild
        process.on('unhandledRejection', error => {
            console.error('Beklenmeyen hata:', error);
        });

        // @guild
        await connectToDatabase();
        
        // @guild
        const handlers = fs.readdirSync('./handlers').filter(file => file.endsWith('.js'));
        for (const file of handlers) {
            require(`./handlers/${file}`)(client);
        }

        // @guild
        await client.login(process.env.TOKEN);
                
    } catch (error) {
        console.error('❌ Başlatma hatası:', error);
    }
}

// @guild
process.on('uncaughtException', error => {
    console.error('Kritik hata:', error);
});

main().catch(err => {
    console.error('❌ Ana program hatası:', err);
}); 