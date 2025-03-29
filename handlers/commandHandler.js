const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.commands = new Map();
    
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name, command);
            console.log(`✅ Komut yüklendi: ${command.name}`);
        } else {
            console.warn(`⚠️ ${filePath} komut dosyasında name veya execute özelliği eksik.`);
        }
    }
}; 