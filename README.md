# Berber — Randevu Sistemi

> **English:** This repository includes a barber shop appointment system (customer site + barber panel). For the full English documentation, open **[docs/README.en.md](docs/README.en.md)**.

Erkek kuaförü / berber dükkanları için geliştirilmiş randevu yönetim sitesi. **TR / EN** dil desteği (müşteri sitesi ve berber paneli). Müşteriler online randevu alabilir; berberler ayrı panelden randevularını görüntüleyebilir ve telefonla alınan randevuları manuel ekleyebilir.

**Canlı demo:** [https://eersoy-barber.vercel.app/](https://eersoy-barber.vercel.app/) · Berber paneli: [/berber-panel.html](https://eersoy-barber.vercel.app/berber-panel.html)

## Ekran görüntüleri

Aşağıdaki görseller **Türkçe (TR)** arayüzü gösterir.

### Müşteri sitesi

**Bilgi**

![Bilgi ekranı](docs/screenshots/tr_bilgiekrani.png)

**Hizmetler**

![Hizmetler](docs/screenshots/tr_hizmetlerimiz.png)

**Randevu oluşturma**

![Randevu oluşturma formu](docs/screenshots/tr_musteri_randevu.png)

**Doldurulmuş randevu formu**

![Doldurulmuş randevu formu](docs/screenshots/tr_musteri_randevu_dolu.png)

**Randevu sorgulama ve iptal**

![Randevu sorgulama](docs/screenshots/tr_musteri_randevu_takip.png)

**İletişim**

![İletişim ekranı](docs/screenshots/tr_iletisimEkrani.png)

### Berber paneli

**Giriş ekranı**

![Berber paneli giriş](docs/screenshots/tr_berberPanel_giris.png)

**Takvim, randevu listesi ve iptal**

![Berber paneli dashboard](docs/screenshots/tr_berberPanel.png)

**Manuel randevu ekleme**

![Berber paneli manuel randevu](docs/screenshots/tr_manuelRandevu_berberPanel.png)

## Özellikler

### Müşteri sitesi (`index.html`)

- **Bilgi** — Dükkan hakkında tanıtım
- **Hizmetler** — Saç kesimi, sakal tıraşı vb. fiyat listesi
- **Randevu oluşturma** — Berber, hizmet, açılır takvim, saat seçimi
- **Randevu sorgulama** — Ad ve telefon ile randevuları görüntüleme ve iptal etme
- **İletişim** — Adres, telefon, e-posta, çalışma saatleri
- **TR / EN** dil seçici (müşteri sitesi ve berber paneli)
- Dolu saatler otomatik işaretlenir; aynı berber + tarih + saat tekrar alınamaz
- Geçmiş randevular otomatik silinir

### Berber paneli (`berber-panel.html`)

- PIN ile berber girişi
- **TR / EN** dil seçici (müşteri sitesi ile aynı tercih paylaşılır)
- Aylık **takvim** görünümü (randevulu günler işaretli)
- Randevu listesi (güne göre filtreleme)
- **Manuel randevu ekleme** (telefonla alınan randevular için)
- Eklenen randevular müşteri sitesinde dolu saat olarak görünür

## Teknolojiler

- HTML5, CSS3
- Vanilla JavaScript (ES Modules)
- **Supabase** (PostgreSQL) — canlı ortam veritabanı (Vercel)
- Node.js + Express + SQLite — yerel geliştirme (`npm start`)
- `localStorage` — yalnızca dil tercihi (`appLanguage`)
- `sessionStorage` — berber oturumu (tarayıcıda)

Frontend için React/Vue gibi framework kullanılmaz. Canlı sitede randevular **Supabase** üzerinde kalıcı olarak saklanır.

## Canlı site (Vercel + Supabase)

Proje [Vercel](https://vercel.com) üzerinde yayınlanır; randevu verisi [Supabase](https://supabase.com) PostgreSQL veritabanında tutulur.

## Yerel geliştirme (opsiyonel)

### 1. Projeyi indirin

**Seçenek A — Git ile klonlama:**

```bash
git clone https://github.com/KULLANICI_ADI/barberApp.git
cd barberApp
```

**Seçenek B — ZIP indirme:**

GitHub sayfasında **Code → Download ZIP** tıklayın, arşivi açın ve proje klasörüne girin.

### 2. Bağımlılıkları kurun

[Node.js](https://nodejs.org/) (v18 veya üzeri önerilir) yüklü olmalıdır:

```bash
npm install
```

### 3. Sunucuyu başlatın

```bash
npm start
```

Bu komut Express API sunucusunu başlatır, SQLite veritabanını oluşturur ve statik dosyaları (müşteri sitesi + berber paneli) sunar.

Geliştirme sırasında dosya değişikliklerinde sunucuyu otomatik yeniden başlatmak için:

```bash
npm run dev
```

### 4. Tarayıcıda açın

Sunucu çalışırken tarayıcıda şu adreslere gidin:

| Sayfa | Adres |
|-------|--------|
| Müşteri sitesi | [http://localhost:8080](http://localhost:8080) |
| Berber paneli | [http://localhost:8080/berber-panel.html](http://localhost:8080/berber-panel.html) |

> Portu değiştirmek için `PORT=3000 npm start` kullanın (Windows PowerShell: `$env:PORT=3000; npm start`).

### 5. Hızlı test

1. Müşteri sitesinden bir randevu oluşturun
2. **Randevularım** bölümünden ad ve telefon ile sorgulayın
3. Footer'daki **Berber Paneli** linkinden panele girin (ör. Mehmet İmrek — PIN: `1111`)



## Berber paneli giriş bilgileri (demo)

| Berber          | PIN  |
|-----------------|------|
| Mehmet İmrek    | 1111 |
| Hikmet Görmez   | 2222 |
| Ramazan Hamza   | 3333 |

PIN kodları `src/config/constants.js` dosyasındaki `BARBER_PINS` alanından değiştirilebilir.

## Proje yapısı

```
barberApp/
├── index.html              # Müşteri sitesi
├── berber-panel.html       # Berber paneli
├── styles.css              # Ortak stiller
├── env.js                  # Supabase bağlantı bilgileri (deploy'da üretilir)
├── env.example.js          # env.js şablonu
├── vercel.json             # Vercel deploy ayarları
├── package.json
├── scripts/
│   └── generate-env.js     # env.js üretici (build)
├── supabase/
│   └── schema.sql          # PostgreSQL tablo + RLS
├── server/                 # Yerel geliştirme (Express + SQLite)
│   ├── index.js
│   ├── db.js
│   └── routes/
│       └── appointments.js
├── docs/
│   ├── README.en.md
│   └── screenshots/
├── README.md
└── src/
    ├── main.js             # Müşteri sitesi giriş noktası
    ├── panel-main.js       # Berber paneli giriş noktası
    ├── config/
    │   ├── constants.js
    │   └── env.js          # Ortam okuma yardımcısı
    ├── domain/
    ├── application/
    ├── infrastructure/     # Repository katmanı
    ├── patterns/
    ├── validation/
    ├── presentation/
    │   ├── views/
    │   └── controllers/
    ├── i18n/
    └── utils/
```

## Mimari (MVC, GOF & GRASP)

Proje katmanlı ve desen odaklı yapılandırılmıştır. Bağımlılıklar `main.js` ve `panel-main.js` içinde birleştirilir (**Composition Root**).

### MVC katmanları

| Katman | Klasör | Sorumluluk |
|--------|--------|------------|
| **Model** | `domain/` | `Appointment`, `TimeSlot` — veri ve domain mantığı |
| **View** | `presentation/views/` | DOM gösterme, render (`*View.js`) |
| **Controller** | `presentation/controllers/` | Kullanıcı olayları, facade çağrısı (`*Controller.js`) |

İş kuralları Model’de değil; `application/` katmanındaki Service ve Facade sınıflarında tutulur. Controller doğrudan repository’ye erişmez.

### GOF (Gang of Four)

| Desen | Kullanım |
|-------|----------|
| **Singleton** | `EventBus`, `SupabaseAppointmentRepository`, `ApiAppointmentRepository`, `I18n` |
| **Factory Method** | `AppointmentFactory` — form verisinden `Appointment` üretimi |
| **Observer** | `EventBus` — randevu ve dil değişikliklerinde UI güncelleme |
| **Strategy** | `RequiredFieldsValidation`, `PhoneValidation`, `SlotAvailabilityValidation` vb. |
| **Composite** | `CompositeValidator` — birden fazla doğrulama kuralını tek akışta birleştirir |
| **Facade** | `BookingFacade`, `BarberPanelFacade` — UI için sadeleştirilmiş arayüz |

### GRASP

| İlke | Kullanım |
|------|----------|
| **Information Expert** | `Appointment` — çakışma, müşteri eşleştirme, telefon doğrulama; `TimeSlot` — müsaitlik durumu |
| **Creator** | `AppointmentFactory` — randevu nesnesini oluşturma sorumluluğu |
| **Controller** | `AppointmentFormController`, `AppointmentLookupController`, `BarberPanelController`, `BarberManualAppointmentController`, `TimeSlotPresenter`; uygulama katmanında `AppointmentService` |
| **Pure Fabrication** | `EventBus`, `AvailabilityService`, `AppointmentLookupService`, `BarberPanelService`, `SupabaseAppointmentRepository`, `ApiAppointmentRepository` |
| **Protected Variations** | `IAppointmentRepository` — depolama detayını (Supabase / Express API) soyutlar |

### Depolama

| Ortam | Repository | Veritabanı |
|-------|------------|------------|
| **Vercel** | `SupabaseAppointmentRepository` | Supabase (PostgreSQL) |
| **Yerel (`npm start`)** | `ApiAppointmentRepository` | SQLite (`server/data/barber.db`) |

`createAppointmentRepository()` ortam değişkenlerine göre otomatik seçim yapar.

## Yapılandırma

`src/config/constants.js` dosyasında:

- `SERVICE_LABELS` — Hizmet adları
- `BARBER_LABELS` — Berber adları
- `BARBER_PINS` — Panel giriş PIN'leri
- `TIME_SLOTS` — Çalışma saatleri (09:00–19:00)

Dükkan adı, adres, telefon ve fiyatlar `index.html` içinden düzenlenebilir. Berber adları `src/config/constants.js` dosyasındaki `BARBER_LABELS` alanından güncellenir.

**Dükkan adresi:** Maslak Mahallesi, Çınar Sokak, No: 1, Sarıyer / İstanbul

## Önemli notlar

- **Canlı sitede** randevular Supabase PostgreSQL veritabanında kalıcı olarak saklanır.
- **Yerel geliştirmede** randevular SQLite dosyasında tutulur (`server/data/barber.db`).
- Dil tercihi tarayıcının `localStorage` alanında saklanır; berber oturumu `sessionStorage` kullanır.
- Pazar günleri randevu alınamaz; geçmiş randevular otomatik temizlenir.
- Müşteri randevusunda telefon zorunludur; berber manuel randevusunda telefon isteğe bağlıdır.

## Lisans

Bu proje demo amaçlı geliştirilmiştir.
