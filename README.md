# 🤖 Discord Abone Rol Botu V2

Bu bot, Discord sunucunuzda abone rolü verme işlemlerini kolaylaştırmak ve yönetmek için tasarlanmıştır. Gelişmiş OCR (Görsel Tanıma) teknolojisi ile kullanıcıların abone olduğunu gösteren ekran görüntülerini otomatik olarak algılayabilir.

## 🚀 Özellikler

- ✅ Abone rolü verme ve alma
- 📷 **Görsel tanıma ile otomatik abonelik doğrulama (OCR)**
- 🚫 **Son video algılama ile abonelik sahteciliğini önleme**
- 📊 Görsel ve zengin abone istatistikleri
- 📈 Yetkililerin verdiği abone sayılarını izleme ve sıralama
- 📝 İşlemleri özel log kanalında kaydetme
- 🔄 **JSON tabanlı veri depolama (MongoDB gerekmez!)**
- ⚙️ Kolay ayarlanabilir yapılandırma

## 📋 Gereksinimler

- Node.js v16.9.0 veya daha yüksek
- Discord Bot Token

## 💻 Kurulum

1. Repoyu klonlayın
```
git clone https://github.com/kullaniciadi/discord-abone-bot.git
cd discord-abone-bot
```

2. Gerekli paketleri yükleyin
```
npm install
```

3. `.env` dosyasını düzenleyin
```
BOT_TOKEN=DISCORD_BOT_TOKENINIZ
```

4. Botu başlatın
```
node index.js
```

## ⚙️ Yapılandırma

`config.js` dosyasını düzenleyerek botun ayarlarını yapabilirsiniz veya Discord üzerinden komutlarla ayarları değiştirebilirsiniz.

### Discord üzerinden ayarlar:

- `!aboneayar abonerol @rol` - Abone rolünü ayarlar
- `!aboneayar yetkilirol @rol` - Yetkili rolünü ayarlar
- `!aboneayar logkanal #kanal` - Log kanalını ayarlar
- `!aboneayar onaykanal #kanal` - Görsel doğrulama kanalını ayarlar
- `!aboneayar ocr aç/kapat` - Görsel doğrulama sistemini açar/kapatır

## 📝 Komutlar

### Abone Komutları
- `!abone @kullanıcı` - Belirtilen kullanıcıya abone rolü verir.
- `!aboneal @kullanıcı` - Belirtilen kullanıcıdan abone rolünü alır.

### İstatistik Komutları
- `!abonestat [@kullanıcı]` - Belirtilen kullanıcının abone istatistiklerini gösterir.
- `!toplam` - Sunucudaki toplam abone istatistiklerini ve en iyi 5 yetkiliyi gösterir.

### Ayar Komutları (Yönetici)
- `!aboneayar` - Ayar menüsünü gösterir.
- `!yardım` - Botun komutları hakkında bilgi verir.

## 📷 Görsel Doğrulama Sistemi

1. Sunucuda `!aboneayar onaykanal #kanal` komutu ile bir doğrulama kanalı ayarlayın.
2. OCR sistemini `!aboneayar ocr aç` komutu ile etkinleştirin.
3. Kullanıcılar bu kanala abone olduklarını gösteren bir ekran görüntüsü gönderdiğinde, sistem:
   - Görüntüyü otomatik olarak analiz eder
   - Abone olma durumunu kontrol eder
   - Son videoya aboneliği reddeder (sahtecilik önlemi)
   - Başarılı doğrulama durumunda otomatik olarak abone rolü verir

## 📋 Veri Saklama

Bot verileri JSON formatında `data` klasöründe saklar:
- `aboneler.json` - Abone olan kullanıcıların kayıtları
- `counters.json` - Yetkililerin verdiği abone sayıları
- `channels.json` - Sunucu ayarları

## 🤝 Katkıda Bulunma

1. Projeyi forklayın
2. Özellik branch'i oluşturun (`git checkout -b ozellik/yeniozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik: Açıklama'`)
4. Branch'inizi push edin (`git push origin ozellik/yeniozellik`)
5. Pull Request açın 