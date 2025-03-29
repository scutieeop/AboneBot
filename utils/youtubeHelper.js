const axios = require('axios');
const youtubedl = require('youtube-dl-exec');

/**
 * YouTube kanal ID'sini ve bilgilerini çıkaran yardımcı fonksiyonlar
 */
module.exports = {
    // @guild
    extractChannelId: function(url) {
        // @guild
        url = url.trim();
        
        // @guild
        url = url.replace(/\s+/g, '');
        
        // @guild
        if (!url) return null;
        
        try {
            // @guild
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                const urlObj = new URL(url);
                
                // @guild
                if (url.includes('/channel/')) {
                    return url.split('/channel/')[1].split('/')[0].split('?')[0];
                }
                // @guild
                else if (url.includes('/c/') || url.includes('/@')) {
                    // @guild
                    return url.split('/').pop().split('?')[0];
                }
                // @guild
                else if (url.includes('/user/')) {
                    return url.split('/user/')[1].split('/')[0].split('?')[0];
                }
                
                // @guild
                return null;
            }
            
            return null;
        } catch (error) {
            console.error('Kanal ID çıkarma hatası:', error);
            return null;
        }
    },

    // @guild
    getChannelInfoFromId: async function(channelId) {
        try {
            const result = await youtubedl(`https://youtube.com/channel/${channelId}`, {
                dumpSingleJson: true,
                skipDownload: true,
                noWarnings: true,
                noCallHome: true
            });
            
            return {
                id: channelId,
                title: result.channel || result.uploader,
                url: result.channel_url || result.uploader_url
            };
        } catch (error) {
            console.error('Kanal bilgisi getirme hatası:', error);
            return null;
        }
    },
    
    // @guild
    doesTextContainChannelName: function(text, channelName) {
        if (!text || !channelName) return false;
        
        // İlk olarak orijinal metni saklayalım (büyük/küçük harf korunarak)
        const originalText = text.trim();
        
        // @guild
        text = text.toLowerCase().trim();
        
        // Orijinal kanal adını koruyan değişken
        const originalChannelName = channelName.trim();
        channelName = channelName.toLowerCase().trim();
        
        // @guild - Direkt metin içinde arama
        if (text.includes(channelName)) {
            console.log(`Kanal adı "${channelName}" metin içinde bulundu (küçük harfle)`);
            return true;
        }
        
        // Orijinal metinde orijinal kanal adı araması (büyük/küçük harf duyarlı)
        if (originalText.includes(originalChannelName)) {
            console.log(`Kanal adı "${originalChannelName}" metin içinde birebir bulundu`);
            return true;
        }
        
        // İlk harfi büyük yazılmış kanal adı kontrolü
        const titleCaseChannelName = channelName.charAt(0).toUpperCase() + channelName.slice(1);
        if (originalText.includes(titleCaseChannelName)) {
            console.log(`Kanal adı "${titleCaseChannelName}" metin içinde bulundu (İlk harf büyük)`);
            return true;
        }
        
        // @guild - Kelime bazlı arama
        const channelWords = channelName.split(/\s+/);
        let matchedWords = 0;
        
        for (const word of channelWords) {
            if (word.length > 1 && text.includes(word)) {
                matchedWords++;
            }
        }
        
        // @guild - Kelime oranı kontrolü
        if (channelWords.length > 0 && matchedWords / channelWords.length >= 0.5) {
            console.log(`Kanal adının ${matchedWords}/${channelWords.length} kelimesi metinde bulundu`);
            return true;
        }
        
        // @guild - Etiket kontrolü
        const etiketler = [
            '@' + channelName.replace(/\s+/g, ''),
            '@' + originalChannelName.replace(/\s+/g, ''),
            '@' + channelName,
            '@' + originalChannelName
        ];
        
        for (const etiket of etiketler) {
            if (text.includes(etiket.toLowerCase()) || originalText.includes(etiket)) {
                console.log(`Kanal etiketi "${etiket}" metinde bulundu`);
                return true;
            }
        }
        
        // @guild - Guild özel kontrolü
        if (channelName === 'guild' || channelName.includes('guild')) {
            // Daha esnek guild deseni
            const guildPattern = /g[uüvyı]*[iı1!l]+[lí]*d/i;
            if (guildPattern.test(text)) {
                console.log('Guild pattern metinde bulundu');
                return true;
            }
            
            // Boşluklu guild kontrolü
            if (/g[^\w]*u[^\w]*i[^\w]*l[^\w]*d/i.test(text)) {
                console.log('Boşluklu guild deseni metinde bulundu');
                return true;
            }
            
            // Yaygın guild varyasyonları
            const guildVariations = ['guild', 'guíld', 'guíld', 'gúild', 'guiild', 'g u i l d', 'g.u.i.l.d', 'guilld', 'guld', 'gild'];
            for (const variation of guildVariations) {
                if (text.includes(variation)) {
                    console.log(`Guild varyasyonu "${variation}" metinde bulundu`);
                    return true;
                }
            }
        }
        
        return false;
    },
    
    // @guild
    doesTextContainYouTubeURL: function(text) {
        if (!text) return false;
        
        // @guild
        text = text.toLowerCase().trim();
        
        // @guild
        if (text.includes('youtube.com/watch') || 
            text.includes('youtu.be/') ||
            text.includes('youtube.com/channel/') ||
            text.includes('youtube.com/c/') ||
            text.includes('youtube.com/@')) {
            return true;
        }
        
        // @guild
        const youtubePattern = /(youtube|youtu\.be)/i;
        if (youtubePattern.test(text)) {
            return true;
        }
        
        return false;
    },
    
    // @guild
    verifySubscription: async function(text, channelInfo) {
        // @guild
        const containsSubscriptionKeywords = this.checkSubscriptionKeywords(text);
        
        if (!containsSubscriptionKeywords) {
            return { success: false, error: 'Abonelik durumu doğrulanamadı.' };
        }
        
        // @guild
        if (!channelInfo) {
            // @guild
            return { success: true };
        }
        
        const channelName = channelInfo.ad || channelInfo.title;
        
        // @guild
        if (channelName.toLowerCase().includes('guild')) {
            // @guild
            if (this.doesTextContainGuild(text)) {
                return { success: true };
            }
        }
        
        // @guild
        const containsChannelName = this.doesTextContainChannelName(text, channelName);
        const containsYouTubeURL = this.doesTextContainYouTubeURL(text);
        
        if (containsChannelName || containsYouTubeURL) {
            return { success: true };
        }
        
        // @guild
        return {
            success: false,
            error: `Belirtilen YouTube kanalına (${channelName}) ait bir abonelik ekran görüntüsü tespit edilemedi.`
        };
    },
    
    // @guild
    doesTextContainGuild: function(text) {
        if (!text) return false;
        
        const lowerText = text.toLowerCase().trim();
        
        // @guild
        const guildVariations = ['guild', 'guíld', 'guíld', 'gúild', 'guiild', 'g u i l d', 'g.u.i.l.d', 'guilld'];
        
        for (const variation of guildVariations) {
            if (lowerText.includes(variation)) {
                return true;
            }
        }
        
        // @guild
        if (/g[^\w]*u[^\w]*i[^\w]*l[^\w]*d/i.test(lowerText)) {
            return true;
        }
        
        // @guild
        const discordUIClues = ['kanala katil', 'abone ol', 'this server', 'sunucu', 'kanal', 'mesaj'];
        
        for (const clue of discordUIClues) {
            if (lowerText.includes(clue)) {
                return true;
            }
        }
        
        return false;
    },
    
    // @guild
    checkSubscriptionKeywords: function(text) {
        if (!text) return false;
        
        const lowerText = text.toLowerCase().trim();
        
        // @guild
        const subscriptionKeywords = [
            'abone olundu', 'aboneolundu', 'subscribed',
            'abone oldu', 'abone oldun', 'abonesin',
            'abonelikten', 'subscription', '√ sub'
        ];
        
        for (const keyword of subscriptionKeywords) {
            if (lowerText.includes(keyword)) {
                return true;
            }
        }
        
        // @guild
        const youtubeUIClues = ['paylaş', 'bildir', 'kaydet', 'abone'];
        let uiCluesCount = 0;
        
        for (const clue of youtubeUIClues) {
            if (lowerText.includes(clue)) {
                uiCluesCount++;
            }
        }
        
        // @guild
        if (uiCluesCount >= 2) {
            return true;
        }
        
        return false;
    }
}; 