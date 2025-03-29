// @guild
// @guild
// @guild

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// @guild
const FONT_FOLDER = path.join(__dirname, '../assets/fonts');
const IMG_FOLDER = path.join(__dirname, '../assets/images');

// @guild
function ensureDirsExist() {
    if (!fs.existsSync(FONT_FOLDER)) {
        fs.mkdirSync(FONT_FOLDER, { recursive: true });
    }
    if (!fs.existsSync(IMG_FOLDER)) {
        fs.mkdirSync(IMG_FOLDER, { recursive: true });
    }
}

// @guild
function registerFonts() {
    try {
        ensureDirsExist();
        // @guild
        // @guild
        try {
            registerFont(path.join(FONT_FOLDER, 'Montserrat-Bold.ttf'), { family: 'Montserrat', weight: 'bold' });
            registerFont(path.join(FONT_FOLDER, 'Montserrat-Regular.ttf'), { family: 'Montserrat', weight: 'normal' });
        } catch (e) {
            console.log('Özel fontlar yüklenemedi, sistem fontları kullanılacak.');
        }
    } catch (error) {
        console.error('Font kayıt hatası:', error);
    }
}

// @guild
const COLORS = {
    background: '#1a1a1a',
    cardBg: '#2a2a2a',
    primary: config.embedRenk || '#0099ff',
    secondary: '#f0f0f0',
    text: '#ffffff',
    textDark: '#cccccc',
    accent: '#ff5555',
    success: '#55ff55'
};

// @guild
async function createAboneStatCanvas(user, stats, avatarURL) {
    registerFonts();
    
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');
    
    // @guild
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // @guild
    roundedRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 20);
    ctx.fillStyle = COLORS.cardBg;
    ctx.fill();
    
    // @guild
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ABONE İSTATİSTİKLERİ', canvas.width / 2, 80);
    
    // @guild
    try {
        const avatar = await loadImage(avatarURL);
        const avatarSize = 120;
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 170, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, canvas.width / 2 - avatarSize / 2, 170 - avatarSize / 2, avatarSize, avatarSize);
        ctx.restore();
    } catch (error) {
        console.error('Avatar yükleme hatası:', error);
    }
    
    // @guild
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(user.username, canvas.width / 2, 250);
    
    // @guild
    ctx.fillStyle = COLORS.textDark;
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Verilen Abone Rolü:', 120, 320);
    
    // @guild
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 60px Arial';
    ctx.fillText(stats.count.toString(), 450, 330);
    
    // @guild
    if (stats.lastUpdated) {
        ctx.fillStyle = COLORS.textDark;
        ctx.font = '24px Arial';
        ctx.fillText('Son Abone Rolü Verme:', 120, 390);
        
        ctx.fillStyle = COLORS.text;
        ctx.font = 'bold 24px Arial';
        ctx.fillText(new Date(stats.lastUpdated).toLocaleDateString('tr-TR'), 450, 390);
    }
    
    // @guild
    ctx.fillStyle = COLORS.textDark;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Abone Bot v2.0 • Gelişmiş İstatistik Sistemi', canvas.width / 2, canvas.height - 40);
    
    // @guild
    return canvas.toBuffer();
}

// @guild
async function createTotalAboneCanvas(aboneSayisi, rolluUyeSayisi, guild) {
    registerFonts();
    
    const canvas = createCanvas(800, 700);
    const ctx = canvas.getContext('2d');
    
    // @guild
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // @guild
    roundedRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 20);
    ctx.fillStyle = COLORS.cardBg;
    ctx.fill();
    
    // @guild
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TOPLAM ABONE İSTATİSTİKLERİ', canvas.width / 2, 80);
    
    // @guild
    try {
        const serverIcon = await loadImage(guild.iconURL({ extension: 'png' }) || 'https://example.com/placeholder.png');
        const iconSize = 120;
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 170, iconSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(serverIcon, canvas.width / 2 - iconSize / 2, 170 - iconSize / 2, iconSize, iconSize);
        ctx.restore();
    } catch (error) {
        console.error('Sunucu ikonu yükleme hatası:', error);
    }
    
    // @guild
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(guild.name, canvas.width / 2, 250);
    
    // @guild
    ctx.fillStyle = COLORS.textDark;
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Veritabanındaki Toplam Abone:', 120, 320);
    
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 50px Arial';
    ctx.fillText(aboneSayisi.toString(), 600, 325);
    
    // @guild
    ctx.fillStyle = COLORS.textDark;
    ctx.font = '24px Arial';
    ctx.fillText('Sunucudaki Abone Rolü Olan Üye:', 120, 390);
    
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 50px Arial';
    ctx.fillText(rolluUyeSayisi.toString(), 600, 395);
    
    // @guild
    ctx.fillStyle = COLORS.textDark;
    ctx.font = '24px Arial';
    ctx.fillText('Abone Oranı:', 120, 460);
    
    // @guild
    const percentage = Math.round((aboneSayisi / guild.memberCount) * 100) || 0;
    
    // @guild
    ctx.fillStyle = '#444444';
    roundedRect(ctx, 120, 480, 560, 40, 10);
    ctx.fill();
    
    // @guild
    ctx.fillStyle = COLORS.primary;
    if (percentage > 0) {
        roundedRect(ctx, 120, 480, (560 * percentage) / 100, 40, 10);
        ctx.fill();
    }
    
    // @guild
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${percentage}% (${aboneSayisi}/${guild.memberCount})`, canvas.width / 2, 505);
    
    // @guild
    ctx.fillStyle = COLORS.textDark;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Abone Bot v2.0 • Gelişmiş İstatistik Sistemi', canvas.width / 2, canvas.height - 40);
    
    // @guild
    return canvas.toBuffer();
}

// @guild
async function createTopSubscribersCanvas(topSubscribers, guild) {
    registerFonts();
    
    const canvas = createCanvas(800, 700);
    const ctx = canvas.getContext('2d');
    
    // @guild
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // @guild
    roundedRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 20);
    ctx.fillStyle = COLORS.cardBg;
    ctx.fill();
    
    // @guild
    ctx.fillStyle = COLORS.primary;
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EN ÇOK ABONE ROLÜ VERENLER', canvas.width / 2, 80);
    
    // @guild
    try {
        const serverIcon = await loadImage(guild.iconURL({ extension: 'png' }) || 'https://example.com/placeholder.png');
        const iconSize = 80;
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 140, iconSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(serverIcon, canvas.width / 2 - iconSize / 2, 140 - iconSize / 2, iconSize, iconSize);
        ctx.restore();
    } catch (error) {
        console.error('Sunucu ikonu yükleme hatası:', error);
    }
    
    // @guild
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 20px Arial';
    ctx.fillText(guild.name, canvas.width / 2, 190);
    
    if (topSubscribers.length === 0) {
        // @guild
        ctx.fillStyle = COLORS.textDark;
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Henüz hiç abone rolü verilmemiş.', canvas.width / 2, 350);
    } else {
        // @guild
        for (let i = 0; i < topSubscribers.length; i++) {
            const subscriber = topSubscribers[i];
            const user = await guild.members.fetch(subscriber.yetkiliID).catch(() => null);
            const username = user ? user.user.username : 'Bilinmeyen Kullanıcı';
            const avatarURL = user ? user.user.displayAvatarURL({ extension: 'png' }) : 'https://example.com/placeholder.png';
            
            // @guild
            let bgColor = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : COLORS.cardBg;
            
            // @guild
            ctx.fillStyle = bgColor;
            roundedRect(ctx, 100, 220 + i * 80, 600, 70, 10);
            ctx.fill();
            
            // @guild
            try {
                const avatar = await loadImage(avatarURL);
                const avatarSize = 50;
                ctx.save();
                ctx.beginPath();
                ctx.arc(140, 255 + i * 80, avatarSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();
                ctx.drawImage(avatar, 140 - avatarSize / 2, 255 + i * 80 - avatarSize / 2, avatarSize, avatarSize);
                ctx.restore();
            } catch (error) {
                console.error('Avatar yükleme hatası:', error);
            }
            
            // @guild
            const medals = ['🥇', '🥈', '🥉', '4', '5'];
            ctx.fillStyle = i < 3 ? '#333333' : COLORS.text;
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(medals[i], 200, 265 + i * 80);
            
            // @guild
            ctx.fillStyle = i < 3 ? '#333333' : COLORS.text;
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(username, 240, 265 + i * 80);
            
            // @guild
            ctx.fillStyle = i < 3 ? '#333333' : COLORS.primary;
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${subscriber.count}`, 650, 265 + i * 80);
        }
    }
    
    // @guild
    ctx.fillStyle = COLORS.textDark;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Abone Bot v2.0 • Gelişmiş İstatistik Sistemi', canvas.width / 2, canvas.height - 40);
    
    // @guild
    return canvas.toBuffer();
}

// @guild
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// @guild
function createAboneStatEmbed(user, stats, avatarURL) {
    const { count, lastUpdated } = stats;
    
    const embed = new EmbedBuilder()
        .setColor(config.embedRenk)
        .setTitle('📊 ABONE İSTATİSTİKLERİ')
        .setDescription(`**${user.username}** kullanıcısının abone istatistikleri`)
        .addFields(
            { 
                name: '🏆 Verilen Abone Rolü Sayısı', 
                value: `\`\`\`yaml\n${count} abone\`\`\``, 
                inline: false 
            }
        )
        .setThumbnail(avatarURL)
        .setFooter({ text: 'Abone Bot v2.0 • Gelişmiş İstatistik Sistemi' })
        .setTimestamp();
    
    if (lastUpdated) {
        embed.addFields({
            name: '⏰ Son Abone Rolü Verme',
            value: `\`\`\`fix\n${new Date(lastUpdated).toLocaleDateString('tr-TR')}\`\`\``,
            inline: false
        });
    }
    
    return embed;
}

// @guild
function createTotalAboneEmbed(aboneSayisi, rolluUyeSayisi, guild) {
    const progressBar = createProgressBar(aboneSayisi, guild.memberCount);
    
    const embed = new EmbedBuilder()
        .setColor(config.embedRenk)
        .setTitle('📊 TOPLAM ABONE İSTATİSTİKLERİ')
        .setDescription(`**${guild.name}** sunucusundaki abone istatistikleri`)
        .addFields(
            { 
                name: '📝 Veritabanındaki Toplam Abone', 
                value: `\`\`\`yaml\n${aboneSayisi} abone\`\`\``, 
                inline: false 
            },
            { 
                name: '👤 Sunucudaki Abone Rolü Olan Üye', 
                value: `\`\`\`yaml\n${rolluUyeSayisi} üye\`\`\``, 
                inline: false 
            },
            {
                name: '📈 Abone Oranı',
                value: progressBar,
                inline: false
            }
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'Abone Bot v2.0 • Gelişmiş İstatistik Sistemi' })
        .setTimestamp();
    
    return embed;
}

// @guild
function createProgressBar(current, total) {
    const percentage = Math.round((current / total) * 100);
    const filledBars = Math.round(percentage / 10);
    
    let barString = '';
    for (let i = 0; i < 10; i++) {
        if (i < filledBars) {
            barString += '■'; // @guild
        } else {
            barString += '□'; // @guild
        }
    }
    
    return `\`\`\`md\n# ${percentage}% [${barString}] (${current}/${total})\`\`\``;
}

// @guild
function createTopSubscribersEmbed(topSubcribers, guild) {
    const embed = new EmbedBuilder()
        .setColor(config.embedRenk)
        .setTitle('🏆 EN ÇOK ABONE ROLÜ VERENLER')
        .setDescription(`**${guild.name}** sunucusundaki en aktif yetkililer`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({ text: 'Abone Bot v2.0 • Gelişmiş İstatistik Sistemi' })
        .setTimestamp();
    
    if (topSubcribers.length === 0) {
        embed.addFields({
            name: 'Bilgi',
            value: 'Henüz hiç abone rolü verilmemiş.',
            inline: false
        });
        return embed;
    }
    
    // @guild
    let description = '';
    
    topSubcribers.forEach((subscriber, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        description += `${medal} <@${subscriber.yetkiliID}> • \`${subscriber.count}\` abone\n`;
    });
    
    embed.setDescription(`**${guild.name}** sunucusundaki en aktif yetkililer\n\n${description}`);
    
    return embed;
}

// @guild
async function createDatabaseResetCanvas(guild, successCount, errorCount, operations) {
    registerFonts();
    
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // Arka plan gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#121212');
    gradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ana kart arka planı
    roundedRect(ctx, 30, 30, canvas.width - 60, canvas.height - 60, 20);
    const cardGradient = ctx.createLinearGradient(0, 30, 0, canvas.height - 30);
    cardGradient.addColorStop(0, '#2a2a2a');
    cardGradient.addColorStop(1, '#252525');
    ctx.fillStyle = cardGradient;
    ctx.fill();
    
    // Üst kısım için dekoratif çizgi
    ctx.beginPath();
    ctx.moveTo(50, 95);
    ctx.lineTo(canvas.width - 50, 95);
    ctx.strokeStyle = '#0099ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Başlık
    ctx.fillStyle = '#0099ff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('VERİTABANI SIFIRLAMA', canvas.width / 2, 75);
    
    // Sunucu ikonu
    let iconLoaded = false;
    try {
        const serverIconURL = guild.iconURL({ extension: 'png', size: 256 });
        if (serverIconURL) {
            const serverIcon = await loadImage(serverIconURL);
            const iconSize = 110;
            ctx.save();
            ctx.beginPath();
            ctx.arc(canvas.width / 2, 160, iconSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(serverIcon, canvas.width / 2 - iconSize / 2, 160 - iconSize / 2, iconSize, iconSize);
            
            // İkon çevresine parlak vurgu çizgisi
            ctx.strokeStyle = '#0099ff';
            ctx.lineWidth = 4;
            ctx.stroke();
            
            ctx.restore();
            iconLoaded = true;
        }
    } catch (error) {
        console.error('Sunucu ikonu yükleme hatası:', error);
    }
    
    // İkon yüklenemezse yedek gösterge
    if (!iconLoaded) {
        const iconSize = 110;
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 160, iconSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = '#3a3a3a';
        ctx.fill();
        ctx.strokeStyle = '#0099ff';
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Sunucu baş harfi gösterimi
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const serverInitial = guild.name.charAt(0).toUpperCase();
        ctx.fillText(serverInitial, canvas.width / 2, 160);
        ctx.restore();
    }
    
    // Sunucu adı
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(guild.name, canvas.width / 2, 230);
    
    // Sıfırlama durumu
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Veritabanı Sıfırlama İşlemi Tamamlandı', canvas.width / 2, 260);
    
    // Dekoratif alt çizgi
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 150, 270);
    ctx.lineTo(canvas.width / 2 + 150, 270);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Sonuç kartları
    // Başarılı kart
    const successGradient = ctx.createLinearGradient(100, 280, 100, 400);
    successGradient.addColorStop(0, '#1b3b1b');
    successGradient.addColorStop(1, '#2a3f2a');
    
    roundedRect(ctx, 100, 290, 270, 120, 15);
    ctx.fillStyle = successGradient;
    ctx.fill();
    
    // Başarılı kart kenar efekti
    ctx.strokeStyle = '#55ff55';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Başarılı ikon
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#55ff55';
    ctx.fillText('✅ BAŞARILI', 235, 330);
    
    // Başarılı sayaç
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(successCount.toString(), 235, 380);
    
    // Başarısız kart
    const errorGradient = ctx.createLinearGradient(430, 280, 430, 400);
    errorGradient.addColorStop(0, '#3b1b1b');
    errorGradient.addColorStop(1, '#3f2a2a');
    
    roundedRect(ctx, canvas.width - 370, 290, 270, 120, 15);
    ctx.fillStyle = errorGradient;
    ctx.fill();
    
    // Başarısız kart kenar efekti
    ctx.strokeStyle = '#ff5555';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Başarısız ikon
    ctx.fillStyle = '#ff5555';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('❌ BAŞARISIZ', canvas.width - 235, 330);
    
    // Başarısız sayaç
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(errorCount.toString(), canvas.width - 235, 380);
    
    // İşlem detayları başlığı
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Sıfırlanan Veriler:', 100, 440);
    
    // İşlem detayları arka planı
    roundedRect(ctx, 100, 450, canvas.width - 200, operations.length * 30 + 10, 10);
    ctx.fillStyle = '#333333';
    ctx.fill();
    
    // İşlem detayları
    let yPos = 475;
    operations.forEach((op, index) => {
        const icon = op.success ? '✅' : '❌';
        ctx.fillStyle = op.success ? '#55ff55' : '#ff5555';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(icon, 120, yPos + (index * 30));
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.fillText(op.name, 150, yPos + (index * 30));
    });
    
    // Alt bilgi çizgisi
    ctx.beginPath();
    ctx.moveTo(100, canvas.height - 50);
    ctx.lineTo(canvas.width - 100, canvas.height - 50);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Alt bilgi
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Abone Bot v2.0 • Veritabanı Yönetimi', canvas.width / 2, canvas.height - 30);
    
    return canvas.toBuffer();
}

module.exports = {
    // @guild
    createAboneStatEmbed,
    createTotalAboneEmbed,
    createTopSubscribersEmbed,
    
    // @guild
    createAboneStatCanvas,
    createTotalAboneCanvas,
    createTopSubscribersCanvas,
    createDatabaseResetCanvas
}; 