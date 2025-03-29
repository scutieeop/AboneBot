module.exports = {
    // @guild
    prefix: '!',
    
    // @guild
    embedRenk: '#0099ff',
    
    // @guild
    ocr: {
        enabled: true, // @guild
        keywords: {
            subscribe: [
                // @guild
                'abone ol', 
                'abone olundu', 
                'abone oldun', 
                'abonesin',
                'abone',
                'abonelik',
                'abonelikten',
                
                // @guild
                'subscribe', 
                'subscribed',
                'subscription',
                
                // @guild
                '@',
                'kanalı',
                'channel',
                
                // @guild
                'kanal',
                'kontrol edilecek',
                'doğrulanırken',
                'videobot',
                'görsel doğrulanıyor'
            ], 
            latestVideo: [
                // @guild
                'son video', 
                'yeni video', 
                'bugün', 
                'saatler önce', 
                'dakika önce', 
                'az önce', 
                'saat önce',
                'gün önce',
                'hafta önce',
                
                // @guild
                'minutes ago',
                'hours ago',
                'days ago',
                'today',
                'new video'
            ]
        },
        
        // @guild
        debug: true
    },
    
    // @guild
    mesajlar: {
        rolyok: '❌ Abone rolü henüz ayarlanmamış! Lütfen sunucu yöneticisi ile iletişime geçin.',
        zatenRolVar: '⚠️ Zaten abone rolüne sahipsiniz!',
        zatenRolYok: '⚠️ Bu kullanıcıda abone rolü zaten yok!',
        kullaniciEtiketle: '⚠️ Lütfen bir kullanıcı etiketleyin!',
        yetkiYok: '❌ Bu komutu kullanmak için gerekli yetkiye sahip değilsiniz!',
        aboneRolVerildi: '✅ {user} kullanıcısına abone rolü verildi!',
        rolverildi: '✅ Abone rolü verildi!',
        rolveritamamlandi: '✅ Rol verme işlemi tamamlandı!',
        aboneyok: '❌ Belirtilen kullanıcı abone değil!',
        rolalindi: '❌ Abone rolü alındı!',
        abonesay: '✅ Toplam **{count}** abone bulunuyor.',
        davetEdilmemis: '❌ Bot sunucuya eklenmemiş! Botun düzgün çalışması için sunucuya ekleyin.',
        permerror: '❌ Bu komutu kullanmak için **Yönetici** yetkisine sahip olmalısınız!',
        gorselDogrulama: {
            formatHatali: '❌ Lütfen geçerli bir görsel formatı yükleyin! (jpg, png, gif)',
            hatali: '❌ Görsel doğrulama başarısız! Neden: {reason}',
            basarili: '✅ Abone görsel doğrulaması başarılı! Abone rolünüz verildi.',
            yanlisDosya: '❌ Belirtilen YouTube kanalına ({kanal}) ait bir abonelik ekran görüntüsü tespit edilemedi! Lütfen doğru kanalın ekran görüntüsünü atın.',
            ipucu: '💡 **İpucu:** YouTube\'da **{kanal}** kanalına gidin, abone olun ve "Abone olundu" yazısını içeren bir ekran görüntüsü atın. Görüntüde kanal adı ve abone olma durumu açıkça görünmelidir.',
            yenidenDene: '⚠️ Görsel doğrulama başarısız oldu! Lütfen **{kanal}** kanalına abone olduğunuzu gösteren daha net bir ekran görüntüsü atın.'
        },
        youtube: {
            kanalAyarlanmadi: '❌ Bu sunucu için YouTube kanal ayarı yapılmamış!',
            kanalAyarlandi: '✅ YouTube kanalı başarıyla ayarlandı: {kanal}',
            gecersizURL: '❌ Geçersiz YouTube kanal URL\'si! Lütfen geçerli bir YouTube kanal linki girin.',
            kanalBilgisi: '📺 YouTube Kanal Bilgisi:\n**Kanal:** {ad}\n**URL:** {url}'
        }
    }
}; 