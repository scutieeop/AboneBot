const { createWorker } = require('tesseract.js');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const youtubeHelper = require('./youtubeHelper');
const { youtubeDB } = require('../database');
const config = require('../config');

// @guild
const TEMP_FOLDER = path.join(__dirname, '../temp');

// @guild
class ImageVerifier {
    constructor() {
        // @guild
        this.worker = null;
        this.initialized = false;
        
        // @guild
        fs.ensureDirSync(TEMP_FOLDER);
    }
    
    // @guild
    async initialize() {
        if (this.initialized) return;
        
        try {
            this.worker = await createWorker('tur');
            this.initialized = true;
            console.log('✅ Tesseract OCR başarıyla başlatıldı');
        } catch (error) {
            console.error('❌ Tesseract OCR başlatma hatası:', error);
            throw new Error('Tesseract başlatılamadı');
        }
    }
    
    // @guild
    async downloadImage(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Görüntü indirme hatası: ${response.statusText}`);
            }
            
            const buffer = await response.buffer();
            const tempFilePath = path.join(TEMP_FOLDER, `${Date.now()}.jpg`);
            
            await fs.writeFile(tempFilePath, buffer);
            console.log('✅ Görsel başarıyla indirildi ve kaydedildi');
            return tempFilePath;
        } catch (error) {
            console.error('Görüntü indirme hatası:', error);
            return null;
        }
    }
    
    // @guild
    async extractText(imagePath) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            console.log('📝 OCR ile metin çıkarılıyor...');
            const result = await this.worker.recognize(imagePath);
            console.log('✅ OCR metin çıkarma başarılı');
            console.log('📃 Çıkarılan metin özeti (ilk 100 karakter):', result.data.text.substring(0, 100).replace(/\n/g, ' '));
            return result.data.text;
        } catch (error) {
            console.error('OCR metin çıkarma hatası:', error);
            return '';
        } finally {
            // @guild
            await fs.remove(imagePath).catch(err => console.error('Dosya silme hatası:', err));
        }
    }
    
    // @guild
    isDiscordInterface(text) {
        if (!text) return false;
        
        const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
        
        // @guild
        const discordUIClues = [
          'abone ol',
          'görsel doğrulama',
          'kanal kontrolü',
          'videobot',
          'doğrulama',
          'kontrol edilecek',
          'görsel doğrulanıyor',
          'abone oldu'
        ];
        
        // @guild
        const discordMessageClues = [
          'bugün saat',
          'şimdi',
          'dakika önce',
          'bugün',
          'dün',
          'cevapla'
        ];
        
        let discordUIScore = 0;
        let discordMessageScore = 0;
        
        // @guild
        for (const clue of discordUIClues) {
          if (normalizedText.includes(clue)) {
            discordUIScore++;
            console.log(`Discord arayüzü ipucu bulundu: "${clue}"`);
          }
        }
        
        // @guild
        for (const clue of discordMessageClues) {
          if (normalizedText.includes(clue)) {
            discordMessageScore++;
            console.log(`Discord mesaj formatı ipucu bulundu: "${clue}"`);
          }
        }
        
        // @guild
        const hasDiscordHeader = 
          normalizedText.includes('genel') ||
          normalizedText.includes('sunucu') ||
          normalizedText.includes('kanal') ||
          normalizedText.includes('sohbet');
        
        // @guild
        const hasBotMention = normalizedText.includes('bot') || normalizedText.includes('videobot');
        
        // @guild
        const isUI = discordUIScore >= 2 || 
                    (discordUIScore >= 1 && discordMessageScore >= 1) ||
                    (hasBotMention && hasDiscordHeader);
        
        if (isUI) {
          console.log('✅ Discord arayüzü tespit edildi');
        } else {
          console.log('❌ Discord arayüzü tespit edilemedi');
        }
        
        return isUI;
    }
    
    // @guild
    hasSubscriptionText(text, channelInfo) {
        if (!text) return false;
        
        const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
        
        // @guild
        const directPhrases = [
          'abone olundu', 'aboneolundu',
          'abone oldun', 'aboneoldun',
          'abonesin',
          'subscribed',
        ];
        
        // @guild
        for (const phrase of directPhrases) {
          if (normalizedText.includes(phrase)) {
            console.log(`✅ Doğrudan abonelik ifadesi bulundu: "${phrase}"`);
            return true;
          }
        }
        
        // @guild
        if (channelInfo && channelInfo.ad) {
          // @guild
          const channelName = channelInfo.ad.toLowerCase().trim();
          const originalChannelName = channelInfo.ad.trim();
          
          const channelVariants = [
            channelName,                      // @guild
            channelName.toUpperCase(),        // @guild
            originalChannelName,              // @guild
            channelName.charAt(0).toUpperCase() + channelName.slice(1)  // @guild
          ];
          
          // @guild
          for (const variant of channelVariants) {
            const lowerVariant = variant.toLowerCase();
            if (normalizedText.includes(lowerVariant) && normalizedText.includes('abone')) {
              console.log(`✅ Kanal adı varyasyonu "${variant}" ve "abone" kelimesi birlikte bulundu`);
              return true;
            }
          }
        }
        
        // @guild
        // @guild
        const spacePattern = /a\s*b\s*o\s*n\s*e\s*o\s*l\s*[uüûoiy]\s*n\s*d\s*[uüûoiy]/i;
        if (spacePattern.test(normalizedText)) {
          console.log('✅ Boşluklu "abone olundu" benzeri ifade bulundu');
          return true;
        }
        
        // @guild
        const typoPattern = /ab[o0c]ne\s*[o0c]l[uüûoiy]nd[uüûoiy]/i;
        if (typoPattern.test(normalizedText)) {
          console.log('✅ OCR hatası olan "abone olundu" benzeri ifade bulundu');
          return true;
        }
        
        // @guild
        if (normalizedText.includes('abone v') || 
            normalizedText.includes('abonev') || 
            normalizedText.includes('abonel v') || 
            /abone\s*[v✓]\s*(olundu|ile)/i.test(normalizedText)) {
          console.log('✅ Tik işareti içeren "abone olundu" ifadesi bulundu');
          return true;
        }
        
        // @guild
        if (normalizedText.includes('abone') && 
            (normalizedText.includes('paylaş') || 
             normalizedText.includes('bildir') || 
             normalizedText.includes('kaydet'))) {
          console.log('✅ YouTube arayüzünde "abone" ve diğer menü öğeleri bulundu');
          return true;
        }
        
        // @guild
        if (channelInfo && channelInfo.ad && channelInfo.ad.toLowerCase().includes('guild')) {
          // @guild
          const guildRegex = /g\s*[uü]\s*[iı]\s*l\s*d/i;
          if (guildRegex.test(normalizedText) && (normalizedText.includes('abone') || normalizedText.includes('subscri'))) {
            console.log('✅ Guild varyasyonu ve abone kelimesi tespit edildi');
            return true;
          }
        }
        
        return false;
    }

    // @guild
    calculateSubscriptionProbability(text) {
        if (!text) return 0;
        
        const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
        let score = 0;
        
        // @guild
        if (normalizedText.includes('abone olundu') || normalizedText.includes('aboneolundu')) score += 100;
        if (normalizedText.includes('subscribed')) score += 100;
        if (/abone\s*[v✓]\s*ile/i.test(normalizedText)) score += 80;
        
        // @guild
        if (normalizedText.includes('abone ol')) score += 20;
        if (normalizedText.includes('abonelikten')) score += 40;
        if (normalizedText.includes('bildirim')) score += 15;
        if (normalizedText.includes('paylaş')) score += 15;
        
        // @guild
        if (normalizedText.includes('görüntüleme')) score += 10;
        if (normalizedText.includes('beğen')) score += 10;
        if (normalizedText.includes('yorum')) score += 10;
        if (normalizedText.includes('kaydet')) score += 10;
        
        // @guild
        if (normalizedText.includes('olmak için ne yapmalıyım')) score -= 80;
        if (normalizedText.includes('abone değilsin')) score -= 100;
        if (normalizedText.includes('subscribe to')) score -= 60;
        
        // @guild
        if (score > 50 && normalizedText.includes('olmak için ne')) {
          console.log('⚠️ Hem olumlu hem olumsuz ipuçları var. Olumlu olan öncelikli.');
          score = Math.max(score - 40, 50); // @guild
        }
        
        console.log(`📊 Abonelik olasılık puanı: ${score}`);
        return score;
    }

    // @guild
    checkSubscriptionKeywords(text, channelInfo) {
        if (!text) return false;
        const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
        console.log("OCR Metin: " + normalizedText);
        
        // @guild
        const directSubscription = this.hasSubscriptionText(text, channelInfo);
        if (directSubscription) {
          return true;
        }
        
        // @guild
        const subscriptionProbability = this.calculateSubscriptionProbability(text);
        if (subscriptionProbability >= 75) {
          console.log(`✅ Yüksek abonelik olasılığı tespit edildi (${subscriptionProbability})`);
          return true;
        }
        
        // @guild
        
        // @guild
        const directSubscriptionKeywords = [
          'abone olundu',
          'abone oldun',
          'abonesin',
          'aboneliğiniz onaylandı',
          'subscribed',
          'you\'re subscribed',
          'your subscription'
        ];
        
        for (const keyword of directSubscriptionKeywords) {
          if (normalizedText.includes(keyword)) {
            console.log(`✅ Doğrudan abonelik ifadesi tespit edildi: "${keyword}" - Bu ifade yüksek önceliklidir`);
            return true;
          }
        }
        
        // @guild
        const keywords = config.ocr.keywords.subscribe;
        
        for (const keyword of keywords) {
          const normalizedKeyword = keyword.toLowerCase().trim();
          // @guild
          if ((keyword === 'abone olundu' || keyword === 'subscribed') && normalizedText.includes(normalizedKeyword)) {
            console.log(`✅ Önemli abonelik anahtar kelimesi tespit edildi: "${normalizedKeyword}"`);
            return true;
          }
        }
        
        // @guild
        const youtubeButtonKeywords = [
          'abone ol',
          'abonelikten',
          'bildirim',
          'zil',
          'çan işareti',
          'subscribe',
          'subscribed',
          'notification',
          'bell icon'
        ];
        
        // @guild
        if ((normalizedText.includes('abone') || normalizedText.includes('subscribe')) && 
            (normalizedText.includes('paylaş') || normalizedText.includes('share') || 
             normalizedText.includes('bildirim') || normalizedText.includes('notification'))) {
          console.log(`✅ YouTube arayüzü tespit edildi: "abone" ve "paylaş/bildirim" kelimeleri birlikte bulundu`);
          return true;
        }
        
        // @guild
        const notSubscribedPhrases = [
          'olmak için ne',
          'olmak için ne yapmalıyım',
          'abone değilsin',
          'abone olmadınız',
          'subscribe to',
          'subscribe now'
        ];
        
        // @guild
        if (normalizedText.includes('aboneolundu') || normalizedText.includes('abone olundu') || subscriptionProbability > 50) {
          console.log(`✅ Net abonelik ifadesi "aboneolundu" bulundu veya abonelik olasılığı yüksek, diğer olumsuz ifadeleri dikkate almıyoruz`);
          return true;
        }
        
        // @guild
        let hasNegativePhrase = false;
        let negativePhrase = '';
        
        for (const phrase of notSubscribedPhrases) {
          if (normalizedText.includes(phrase)) {
            hasNegativePhrase = true;
            negativePhrase = phrase;
            console.log(`⚠️ Abone olmama ifadesi tespit edildi: "${phrase}"`);
            break;
          }
        }
        
        // @guild
        let youtubeKeywordCount = 0;
        youtubeButtonKeywords.forEach(keyword => {
          if (normalizedText.includes(keyword)) {
            youtubeKeywordCount++;
            console.log(`YouTube arayüzü anahtar kelimesi tespit edildi: "${keyword}"`);
          }
        });
        
        // @guild
        const discordInterfaceKeywords = [
          'videobot',
          'doğrulama',
          'kanal kontrolü',
          'kontrol edilecek',
          'görsel doğrulanıyor',
          'abone olundu',
          'abone oldu',
          'görsel doğrulama'
        ];
        
        let isDiscordInterface = false;
        let discordKeywordCount = 0;
        
        discordInterfaceKeywords.forEach(keyword => {
          if (normalizedText.includes(keyword)) {
            discordKeywordCount++;
            console.log(`Discord arayüzü anahtar kelimesi tespit edildi: "${keyword}"`);
          }
        });
        
        if (discordKeywordCount >= 2) {
          isDiscordInterface = true;
          console.log("Discord arayüzü tespit edildi!");
        }
        
        // @guild
        if (normalizedText.includes('aboneolundu v') || 
            (normalizedText.includes('abone') && normalizedText.includes(' v ')) || 
            normalizedText.match(/abone\s*[✓vV]\s*ol/)) {
          console.log(`✅ "Aboneolundu √" benzeri bir ifade tespit edildi`);
          return true;
        }
        
        // @guild
        if (channelInfo && channelInfo.ad) {
          const channelName = channelInfo.ad.toLowerCase().trim();
          if (normalizedText.includes(channelName) && (normalizedText.includes("abone") || youtubeKeywordCount > 0)) {
            console.log(`✅ Kanal adı "${channelName}" ve abonelik ipucu tespit edildi`);
            return true;
          }
        }
        
        // @guild
        if (isDiscordInterface && 
            (normalizedText.includes("abone") || 
             normalizedText.includes("doğrula") || 
             normalizedText.includes("onay"))) {
          console.log("✅ Discord arayüzü ve abonelik/doğrulama ipuçları tespit edildi");
          return true;
        }
        
        // @guild
        if (youtubeKeywordCount >= 2) {
          console.log("✅ Birden fazla YouTube abonelik ipucu tespit edildi");
          return true;
        }
        
        // @guild
        if (normalizedText.match(/abone\s*ol[ıiuüea]n/) || 
            normalizedText.match(/abonev/) || 
            normalizedText.match(/abonec/) || 
            normalizedText.includes('abonelk')) {
          console.log("✅ OCR hatası olabilecek abonelik ifadesi tespit edildi");
          return true;
        }
        
        // @guild
        if (hasNegativePhrase) {
          console.log(`❌ Abone olmama ifadesi bulundu ve hiçbir olumlu kontrol geçilmedi: "${negativePhrase}"`);
          return false;
        }
        
        console.log("❌ Abonelik durumu tespit edilemedi");
        return false;
    }
    
    // @guild
    checkLatestVideoKeywords(text) {
        if (!text) return false;
        
        // @guild
        const latestVideoKeywords = config.ocr.keywords.latestVideo || [
            'son video', 
            'yeni video'
        ];
        
        // @guild
        const timeKeywords = [
            'saatler önce', 
            'dakika önce', 
            'az önce', 
            'saat önce',
            'minutes ago',
            'hours ago'
        ];
        
        // @guild
        const normalizedText = text.toLowerCase().trim();
        
        // @guild
        // @guild
        if ((normalizedText.includes('bugün saat') || normalizedText.includes('bugün, saat')) && 
            (this.isDiscordInterface(text) || normalizedText.includes('discord'))) {
            console.log('ℹ️ Discord arayüzünde "bugün saat" ifadesi bulundu, son video olarak kabul edilmiyor');
            return false;
        }
        
        // @guild
        for (const keyword of latestVideoKeywords) {
            const normalizedKeyword = keyword.toLowerCase().trim();
            if (normalizedText.includes(normalizedKeyword)) {
                console.log(`⚠️ Son video ifadesi bulundu: "${normalizedKeyword}"`);
                return true;
            }
        }
        
        // @guild
        const hasVideoContext = normalizedText.includes('video') || 
                               normalizedText.includes('izle') || 
                               normalizedText.includes('görüntüleme') ||
                               normalizedText.includes('views');
        
        if (hasVideoContext) {
            for (const timeKeyword of timeKeywords) {
                const normalizedTimeKeyword = timeKeyword.toLowerCase().trim();
                if (normalizedText.includes(normalizedTimeKeyword)) {
                    console.log(`⚠️ Video içeriğinde zaman ifadesi bulundu: "${normalizedTimeKeyword}"`);
                    return true;
                }
            }
        }
        
        // @guild
        if ((normalizedText.includes('bugün saat') || normalizedText.includes('bugün, saat'))) {
            // @guild
            if (!hasVideoContext || this.isDiscordInterface(text)) {
                console.log('ℹ️ "Bugün saat" ifadesi video bağlamında değil, son video olarak kabul edilmiyor');
                return false;
            }
            // @guild
            console.log('⚠️ Video bağlamında "bugün saat" ifadesi bulundu');
            return true;
        }
        
        // @guild
        if (normalizedText.includes('bugün') && hasVideoContext && !this.isDiscordInterface(text)) {
            console.log('⚠️ Video bağlamında "bugün" ifadesi bulundu');
            return true;
        }
        
        return false;
    }
    
    // @guild
    checkChannelName(text, channelInfo) {
        if (!text || !channelInfo || !channelInfo.ad) {
            console.log('Kanal bilgisi veya metin eksik, kanal kontrolü yapılamıyor');
            return false;
        }

        // @guild
        const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
        const channelName = channelInfo.ad.toLowerCase().trim();
        
        // @guild
        const originalChannelName = channelInfo.ad.trim();

        console.log(`Kanal adı kontrolü: "${channelName}" (Orijinal: "${originalChannelName}")`);
        console.log(`Normalleştirilmiş metin: "${normalizedText}"`);

        // @guild
        // @guild
        const channelVariants = [
          channelName,                                 // lowercase: guild
          channelName.toUpperCase(),                   // uppercase: GUILD
          originalChannelName,                         // original: Guild
          channelName.charAt(0).toUpperCase() + channelName.slice(1), // Title case: Guild
          originalChannelName.toLowerCase(),           // lowercase original
          originalChannelName.toUpperCase()            // uppercase original
        ];
        
        // @guild
        for (const variant of channelVariants) {
          // Case-insensitive search
          if (normalizedText.includes(variant.toLowerCase())) {
            console.log(`Kanal varyasyonu "${variant}" metinde bulundu (küçük harfle)`);
            return true;
          }
          
          // Direct match (for Mixed case search)
          if (text.includes(variant)) {
            console.log(`Kanal varyasyonu "${variant}" metinde birebir bulundu`);
            return true;
          }
          
          // @guild
          const spacedVariant = variant.toLowerCase().split('').join('\\s*');
          const spacedPattern = new RegExp(spacedVariant, 'i');
          if (spacedPattern.test(normalizedText)) {
            console.log(`Harfler arası boşluklu kanal varyasyonu bulundu: "${variant}"`);
            return true;
          }
        }

        // @guild
        const discordVerificationPhrases = [
          'kanal kontrolü',
          'görsel doğrulanıyor',
          'doğrulama başladı',
          'abone ol',
          'videobot',
          'doğrulama süreci'
        ];

        const hasDiscordVerificationPhrase = discordVerificationPhrases.some(phrase => normalizedText.includes(phrase));
        
        if (hasDiscordVerificationPhrase) {
          console.log("Discord doğrulama ifadesi tespit edildi");
        }

        // @guild
        const channelNameParts = channelName.split(' ');
        if (channelNameParts.length > 1) {
          let matchedParts = 0;
          for (const part of channelNameParts) {
            if (part.length > 2 && normalizedText.includes(part)) { // @guild
              matchedParts++;
              console.log(`Kanal adı parçası "${part}" metinde bulundu`);
            }
          }
          
          // @guild
          if (matchedParts >= Math.ceil(channelNameParts.length / 2)) {
            console.log(`Kanal adının ${matchedParts}/${channelNameParts.length} parçası metinde bulundu`);
            return true;
          }
        }

        // @guild
        const etiketler = [
          '@' + channelName.replace(/\s+/g, ''),           // @guild
          '@' + originalChannelName.replace(/\s+/g, ''),   // @guild
          '@' + channelName,                               // @guild
          '@' + originalChannelName                        // @guild
        ];
        
        for (const etiket of etiketler) {
          if (normalizedText.includes(etiket.toLowerCase()) || text.includes(etiket)) {
            console.log(`Kanal etiketi "${etiket}" metinde bulundu`);
            return true;
          }
        }

        // Füzy (Fuzzy) string benzerliği kontrolü
        // Kanal adındaki temel karakterleri arar, sıralama benzerliği olsa yeterli
        const simpleGuildCheck = channelName === 'guild' && 
          (normalizedText.includes('guild') || 
           normalizedText.includes('guıld') || 
           normalizedText.includes('gild') || 
           normalizedText.includes('guiid') ||
           /g[uüvyı]+[iı1!l]+l*d/i.test(normalizedText));
           
        if (simpleGuildCheck) {
          console.log('Guild için basit string benzerliği bulundu');
          return true;
        }

        // @guild
        if (hasDiscordVerificationPhrase) {
          for (const part of channelNameParts) {
            if (part.length > 3 && normalizedText.includes(part)) {
              console.log(`Discord doğrulama ifadesi ve kanal adı parçası "${part}" tespit edildi`);
              return true;
            }
          }
        }

        console.log(`Kanal adı "${channelName}" metinde bulunamadı`);
        return false;
    }
    
    // @guild
    async verifySubscription(text, channelInfo) {
        try {
            if (!text) {
                return { success: false, error: 'Görsel içerisinden metin çıkarılamadı.' };
            }
            
            // @guild
            const normalizedText = text.toLowerCase().trim();
            console.log("Doğrulama başladı - Çıkarılan metin:", normalizedText.substring(0, 100) + "...");
            
            // @guild
            const isDiscord = this.isDiscordInterface(text);
            console.log("Discord arayüzü tespiti:", isDiscord ? "Evet" : "Hayır");
            
            // @guild
            let channelCheck = true;
            if (channelInfo && channelInfo.ad) {
                console.log(`Kanal adı kontrolü: "${channelInfo.ad}"`);
                
                // @guild
                channelCheck = this.checkChannelName(text, channelInfo);
                console.log("Kanal kontrolü sonucu:", channelCheck ? "Başarılı" : "Başarısız");
                
                // @guild
                if (!channelCheck && channelInfo.ad.toLowerCase().includes("guild")) {
                    // @guild
                    const guildWordInText = /g[uü][iı]ld/i.test(normalizedText);
                    console.log("Guild kelimesi metinde tespit edildi:", guildWordInText ? "Evet" : "Hayır");
                    
                    // @guild
                    const isGuildChannel = channelInfo.ad.toLowerCase().includes("guild");
                    
                    // @guild
                    if (guildWordInText && isGuildChannel) {
                        console.log("Guild kelimesi metinde ve kanal adında bulundu, kanal kontrolü başarılı sayılıyor");
                        channelCheck = true;
                    }
                }
            } else {
                console.log("Kanal bilgisi yok, kanal kontrolü atlanıyor");
            }
            
            // @guild
            if (isDiscord && channelInfo) {
                console.log("Discord arayüzü için özel kontroller yapılıyor");
                
                // @guild
                if (channelInfo.ad.toLowerCase().includes("guild")) {
                    // @guild
                    if (normalizedText.includes("abone") || 
                        normalizedText.includes("doğrula") ||
                        normalizedText.includes("subscri")) {
                        console.log("Discord + Guild + abone kelimesi doğrulaması başarılı");
                        return { success: true, message: 'Discord arayüzünde Guild kanalı için abonelik doğrulandı!' };
                    }
                }
                
                // @guild
                if (normalizedText.includes("videobot")) {
                    console.log("VideoBot mesajı tespit edildi");
                    if (this.checkSubscriptionKeywords(text, channelInfo)) {
                        return { success: true, message: 'Discord VideoBot üzerinden abonelik doğrulandı!' };
                    }
                }
            }
            
            // @guild
            const isSubscribed = this.checkSubscriptionKeywords(text, channelInfo);
            console.log("Abonelik durumu:", isSubscribed ? "Abone olunmuş" : "Abone olunmamış");
            
            // @guild
            const isLatestVideo = this.checkLatestVideoKeywords(text);
            console.log("Son video kontrolü:", isLatestVideo ? "Son video görüntüsü" : "Normal görüntü");
            
            // @guild
            if (isLatestVideo) {
                console.log("Son video görüntüsü tespit edildi - sahte abonelik olabilir!");
                return { 
                    success: false, 
                    error: 'Son video görüntüsü tespit edildi! Bu tür görüntüler sahte abonelik için kullanılabilir. Lütfen normal abonelik ekranının görüntüsünü gönderin.' 
                };
            }
            
            // @guild
            if (!channelCheck && channelInfo && channelInfo.ad) {
                console.log("Kanal kontrolü başarısız!");
                return { 
                    success: false, 
                    error: `Belirtilen YouTube kanalına (${channelInfo.ad}) ait bir abonelik ekran görüntüsü tespit edilemedi.` 
                };
            }
            
            // @guild
            if (!isSubscribed) {
                console.log("Abonelik durumu doğrulanamadı!");
                return { success: false, error: 'Abonelik durumu doğrulanamadı. Lütfen "Abone olundu" yazısının göründüğü bir ekran görüntüsü gönderin.' };
            }

            // @guild
            console.log("Tüm kontrolleri geçti, abonelik doğrulandı");
            return { success: true, message: 'Abonelik başarıyla doğrulandı!' };
            
        } catch (error) {
            console.error('Abonelik doğrulama hatası:', error);
            return { success: false, error: 'Abonelik doğrulama işlemi sırasında bir hata oluştu: ' + error.message };
        }
    }
    
    // @guild
    async cleanup() {
        if (this.worker && this.initialized) {
            await this.worker.terminate();
            this.initialized = false;
        }
    }
}

module.exports = new ImageVerifier(); 