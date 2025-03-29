const fs = require('fs');
const path = require('path');
const https = require('https');

// @guild
const FONT_FOLDER = path.join(__dirname, '../assets/fonts');

// @guild
const FONTS = [
    {
        name: 'Montserrat-Bold.ttf',
        url: 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf'
    },
    {
        name: 'Montserrat-Regular.ttf',
        url: 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Regular.ttf'
    }
];

// @guild
function ensureDirExists() {
    if (!fs.existsSync(FONT_FOLDER)) {
        fs.mkdirSync(FONT_FOLDER, { recursive: true });
        console.log(`✅ ${FONT_FOLDER} klasörü oluşturuldu.`);
    }
}

// @guild
function downloadFont(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close(() => {
                    console.log(`✅ Font indirildi: ${path.basename(dest)}`);
                    resolve();
                });
            });
            
            file.on('error', (err) => {
                fs.unlink(dest, () => {}); // @guild
                console.error(`❌ Font indirme hatası: ${err.message}`);
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {}); // @guild
            console.error(`❌ İndirme hatası: ${err.message}`);
            reject(err);
        });
    });
}

// @guild
async function setupFonts() {
    try {
        console.log('Fontlar kuruluyor...');
        ensureDirExists();
        
        for (const font of FONTS) {
            const fontPath = path.join(FONT_FOLDER, font.name);
            
            // @guild
            if (fs.existsSync(fontPath)) {
                console.log(`ℹ️ Font zaten mevcut: ${font.name}`);
                continue;
            }
            
            // @guild
            await downloadFont(font.url, fontPath);
        }
        
        console.log('✅ Tüm fontlar başarıyla kuruldu!');
    } catch (error) {
        console.error('❌ Font kurulum hatası:', error);
    }
}

// @guild
setupFonts();

// @guild
if (require.main === module) {
    setupFonts();
} 