# ERP+CRM AZ Production Deployment

Bu repo Vite/React frontend-dir. Docker image statik frontend-i Nginx ile servis edir. Satis, kredit, anbar, kassa ve audit melumatlari real production istifadede mutleq backend API ve transaction-li DB uzerinden islemelidir.

## Local release yoxlamasi

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run verify:deploy
npm.cmd run smoke:prod
```

## SQLite API ve real sessiya

Frontend lokal rejimde brauzer davamlılığını saxlayır. Real istifadəçi girişi, server audit reyestri və SQLite state davamlılığı üçün API-ni ayrıca başladın:

```powershell
$env:ERP_BOOTSTRAP_PASSWORD='minimum-8-simvol-parol'
$env:ERP_BOOTSTRAP_EMAIL='admin@sirketiniz.az'
npm.cmd run api
```

Başqa terminalda frontend-i public API ünvanı ilə başladın:

```powershell
$env:VITE_API_BASE_URL='http://127.0.0.1:8787'
npm.cmd run dev
```

SQLite faylı standart olaraq `data/erpaz.sqlite` ünvanında saxlanır və git-ə əlavə edilmir. İlk giriş yalnız `ERP_BOOTSTRAP_PASSWORD` ilə yaradılmış administrator hesabı ilə mümkündür. Production mühitində API-ni reverse proxy arxasında işlədin, `ERP_DB_PATH`, `ERP_CORS_ORIGIN` və bootstrap məlumatlarını server secret-ləri kimi verin.

`smoke:prod` build olunmus `dist` qovlugunu 127.0.0.1:4173-de acir, 25 modulu, Settings integrity/go-live axinlarini ve mobil overflow-u yoxlayir.

## Public build environment

`.env.example` yalniz numunedir. `VITE_` ile baslayan her deyer brauzer bundle-ine yazilir. API key, DB parolu, SMTP parolu, JWT signing key ve ya basqa sirr burada yazilmir.

- `VITE_API_BASE_URL`: public backend API unvani
- `VITE_DB_PROVIDER`: `sqlite`, `postgres`, `supabase` ve ya secilmis provider
- `VITE_AUDIT_MODE`: production ucun `immutable`
- `VITE_RELEASE_VERSION`: release identifikatoru

`.env`, `.env.local` ve `.env.production` Docker build context-den qesden xaric edilir. CI/CD-de ehtiyac olan public `VITE_` deyerlerini build arg kimi verin.

## Docker

```powershell
docker build `
  --build-arg VITE_APP_ENV=production `
  --build-arg VITE_DB_PROVIDER=postgres `
  --build-arg VITE_RELEASE_VERSION=1.0.0 `
  -t erpaz-operations-suite:1.0.0 .

docker run --rm -p 8080:80 erpaz-operations-suite:1.0.0
Invoke-WebRequest http://127.0.0.1:8080/healthz
```

Image SPA route-larini `index.html`-e yonlendirir, asset-leri cache-leyir, HTML-i cache-den qoruyur ve CSP, HSTS, Referrer, Permissions, frame ve content-type tehlukesizlik basliqlarini verir.

## Real muhit serhadi

- Container-i internet-e birbasa acmayin. TLS sertifikatini load balancer, ingress ve ya reverse proxy uzerinde qurasdirin.
- 80 portuna yalniz TLS terminator-un daxil olmasina icaze verin; public trafik HTTPS uzerinden gelmelidir.
- Backend CORS-u yalniz real frontend domain-i ile mehdudlasdirin. CSP `connect-src` qaydasina backend API domain-i deqiq elave olunmalidir.
- PostgreSQL private network-de olsun; public port acmayin. Gunluk encrypted backup, offsite nuxse ve periodik restore testi saxlayin.
- Auth, role permission, audit append-only yazilislari ve satis-kredit-anbar-kassa transaction-lari server terefde icra olunmalidir.
- Error monitoring, uptime health check, DB alert-lari ve webhook retry queue go-live-dan once aktiv edilmelidir.

## Rollback

1. Her release image-ni immutable tag ile saxlayin: `erpaz-operations-suite:1.0.0`.
2. Deploy-den evvel DB backup ve migration geri-donus planini tesdiq edin.
3. Problem olduqda onceki image tag-ine qayidin.
4. DB migration rollback scripti olmadan production migration icra etmeyin.
