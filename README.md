## Setup

### 1. Siapkan Firebase service account

Buka halaman berikut:

https://console.firebase.google.com/project/{your-project}/settings/serviceaccounts/adminsdk

Langkah:

- download file JSON dari `Generate new private key`
- letakkan file JSON di folder `src/lib/fcm`
- buka `src/lib/fcmservice.ts`
- ubah nilai `PRIVATE_KEY` agar sesuai dengan nama file JSON yang dipakai

Contoh:

```ts
const PRIVATE_KEY = "fcm/warehouse-irflow-firebase-adminsdk-fbsvc-2ad623d1a2.json";
```

Catatan:

- file JSON ini bersifat rahasia
- jangan commit file service account ke repository publik
- project Firebase yang dipakai di aplikasi client harus sama dengan project Firebase yang dipakai di API ini

### 2. Pastikan service account punya izin kirim FCM

Referensi:

https://stackoverflow.com/questions/77987873/fcm-cloudmessaging-messages-create-iam-permission-denied

Jika muncul error permission saat mengirim FCM:

- pastikan service account memiliki role yang cukup
- pada project ini, pendekatan yang dipakai sebelumnya adalah memberi role `owner`
- hapus service account lama jika sudah tidak dipakai

### 3. Atur port server

File `.env`:

```env
PORT=10001
```

Contoh file environment tersedia di `.env.example`.

## Quick Start

Install dependency:

```sh
bun install
```

Jalankan server:

```sh
bun run dev
```

Server akan aktif di:

```txt
http://localhost:10001
```

Cek health sederhana:

```sh
curl http://localhost:10001/
```

## Endpoint

Base URL:

```txt
http://localhost:10001/api
```

Dokumentasi Postman:

- [Lihat dokumentasi API](https://documenter.getpostman.com/view/22245737/2sAY517fUH)

## Autentikasi Header

Project ini memakai header `access-token`.

Token yang saat ini dipakai di source code:

- owner token: `azzGAuvhEmSQIbpiltkmeGwoVbNbLkNd`
- client token: `JplCMngtlapdtFoXSxWFHRkKBhuzzAZa`

Catatan:

- endpoint kirim ke topic memakai owner token
- endpoint kirim ke device tertentu memakai client token
- sebaiknya token dipindahkan ke `.env`, bukan hardcoded di source code

## 1. Kirim Notifikasi ke Semua Device

Gunakan endpoint ini untuk kirim notifikasi ke semua device yang subscribe ke topic tertentu.

Contoh kasus:

- semua device Android subscribe ke topic `warehouse.all`
- backend kirim notifikasi ke topic `warehouse.all`
- semua device yang subscribe akan menerima notifikasi

Referensi Firebase:

- [Firebase topic messaging](https://firebase.google.com/docs/cloud-messaging/migrate-v1?hl=en&authuser=0#example-targeting-multiple-platforms)

### Endpoint

```txt
POST http://localhost:10001/api/fcm/send-notification
```

### Header

```http
Content-Type: application/json
access-token: azzGAuvhEmSQIbpiltkmeGwoVbNbLkNd
```

### Body

```json
{
  "topic": "warehouse.all",
  "title": "Test Notifikasi",
  "body": "Ini notifikasi untuk semua device",
  "image": "https://example.com/image.jpg",
  "data": {
    "targetUrl": "/notification"
  }
}
```

### Contoh `curl` Linux / macOS / PowerShell

```sh
curl -X POST http://localhost:10001/api/fcm/send-notification -H "Content-Type: application/json" -H "access-token: azzGAuvhEmSQIbpiltkmeGwoVbNbLkNd" -d '{"topic":"warehouse.all","title":"Test Notifikasi","body":"Ini notifikasi untuk semua device","data":{"targetUrl":"/notification"}}'
```

### Contoh `curl` Windows CMD

Di Windows CMD, jangan pakai single quote untuk JSON body.

```cmd
curl -X POST http://localhost:10001/api/fcm/send-notification -H "Content-Type: application/json" -H "access-token: azzGAuvhEmSQIbpiltkmeGwoVbNbLkNd" -d "{\"topic\":\"warehouse.all\",\"title\":\"Test Notifikasi\",\"body\":\"Ini notifikasi untuk semua device\",\"data\":{\"targetUrl\":\"/notification\"}}"
```

### Contoh response sukses

```json
{
  "success": true,
  "msg": "Notifikasi berhasil terkirim."
}
```

## 2. Kirim Notifikasi ke Device Tertentu

Gunakan endpoint ini untuk kirim notifikasi ke satu device berdasarkan FCM device token.

Referensi:

- [Firebase target specific device](https://firebase.google.com/docs/cloud-messaging/migrate-v1?hl=en&authuser=0#example_targeting_specific_devices)
- [Lifecycle of FCM device tokens](https://medium.com/@chunilalkukreja/lifecycle-of-fcm-device-tokens-61681bb6fbcf)

### Yang harus disiapkan di aplikasi mobile

Aplikasi mobile harus:

- terhubung ke Firebase project yang sama
- meminta izin notifikasi
- melakukan registrasi FCM
- mengambil `device token`
- mengirim token tersebut ke backend milik aplikasi
- mengupdate token jika berubah

Tanpa `device token`, backend tidak bisa mengirim ke device tertentu.

### Endpoint

```txt
POST http://localhost:10001/api/fcm/send-notification-user
```

### Header

```http
Content-Type: application/json
access-token: JplCMngtlapdtFoXSxWFHRkKBhuzzAZa
```

### Body

```json
{
  "token": "dRGha1saSi62i8S5Q6...",
  "title": "Notifikasi Personal",
  "body": "Notifikasi ini hanya masuk ke satu device",
  "image": "https://example.com/image.jpg",
  "data": {
    "targetUrl": "/notification"
  }
}
```

### Contoh `curl` Linux / macOS / PowerShell

```sh
curl -X POST http://localhost:10001/api/fcm/send-notification-user -H "Content-Type: application/json" -H "access-token: JplCMngtlapdtFoXSxWFHRkKBhuzzAZa" -d '{"token":"dRGha1saSi62i8S5Q6...","title":"Notifikasi Personal","body":"Notifikasi ini hanya masuk ke satu device","data":{"targetUrl":"/notification"}}'
```

### Contoh `curl` Windows CMD

```cmd
curl -X POST http://localhost:10001/api/fcm/send-notification-user -H "Content-Type: application/json" -H "access-token: JplCMngtlapdtFoXSxWFHRkKBhuzzAZa" -d "{\"token\":\"dRGha1saSi62i8S5Q6...\",\"title\":\"Notifikasi Personal\",\"body\":\"Notifikasi ini hanya masuk ke satu device\",\"data\":{\"targetUrl\":\"/notification\"}}"
```

## Integrasi dengan `warehouse-pwa`

Untuk project `warehouse-pwa`:

- kirim ke semua device Android: gunakan topic `warehouse.all`
- kirim ke device tertentu: gunakan FCM token hasil registrasi device

Catatan penting:

- web browser tidak subscribe topic langsung dari client
- untuk web, backend harus menyimpan token web lalu mengirim ke token tersebut secara langsung atau subscribe topic lewat Admin SDK

## Troubleshooting

### `500 Internal Server Error` saat `curl`

Jika request dijalankan dari Windows CMD, penyebab paling umum adalah format JSON body salah karena memakai single quote.

Gunakan format CMD seperti ini:

```cmd
curl -X POST http://localhost:10001/api/fcm/send-notification -H "Content-Type: application/json" -H "access-token: azzGAuvhEmSQIbpiltkmeGwoVbNbLkNd" -d "{\"topic\":\"warehouse.all\",\"title\":\"Test\",\"body\":\"Hello\"}"
```

### Notifikasi tidak masuk ke device

Cek hal berikut:

- device sudah grant permission notifikasi
- device sudah berhasil register ke FCM
- token device masih valid
- topic device benar
- Firebase project antara client dan API sama
- file service account di API berasal dari project Firebase yang sama

## Sampel Percobaan

Contoh percobaan request dan payload dapat dilihat di link berikut:

- https://pastefy.app/MoPw1jEc



