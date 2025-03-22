## Setup

### 1. generate sdk key

https://console.firebase.google.com/project/{your-project}/settings/serviceaccounts/adminsdk

- download file json dengan `generate new private key`

- letakkan file json tersebut di path `/src`

- hapus file example `project-fjsa1-firebase-adminsdk-6gtsk-7e984o2h2b.json`

- ubah value variable `PRIVATE_KEY` di `/src/utils.ts` menjadi nama file json yang telah terdownload

### 2. create account role owner

https://stackoverflow.com/questions/77987873/fcm-cloudmessaging-messages-create-iam-permission-denied

- buat user dengan role `owner`
- hapus user lama/sebelumnya

## Quick Start

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3001

## Api

dokumentasi api: [Lihat dokumentasi (postman)](https://documenter.getpostman.com/view/22245737/2sAY517fUH).

### Kirim Notifikasi ke Semua Perangkat

kirim notifikasi ke semua pengguna dengan key topic

doc: [Lihat dokumentasi firebase](https://firebase.google.com/docs/cloud-messaging/migrate-v1?hl=en&authuser=0#example-targeting-multiple-platforms).

url endpoint

```sh
http://localhost:3001/api/send-notification
```

header _(ubah access-token di .env)_

```sh
Content-Type: application/json
access-token: jUJncRrngRCMCf...
```

body

```sh

{
    "topic":"all",
    "title":"Hello Wi - bu!",
    "body": "Yo, this is your waifu.",
    "image":"https://i.pinimg.com/474x/8c/46/22/8c4622b18c2f21da2e3e09ddde3ade9e.jpg" //opsional
    "data": {
        "payload":"payload-key"  // opsional key n value
    }
}

```

### Kirim Notifikasi ke Spesifik Prangkat

kirim notifikasi ke spesifik device pengguna dengan key deviceToken

doc:

- [Lihat dokumentasi firebase](https://firebase.google.com/docs/cloud-messaging/migrate-v1?hl=en&authuser=0#example_targeting_specific_devices)
- [Medium: lifecycle-of-fcm-device-tokens](https://medium.com/@chunilalkukreja/lifecycle-of-fcm-device-tokens-61681bb6fbcf)

url endpoint

```sh
http://localhost:3001/api/send-notification-user
```

header _(ubah access-token di .env)_

```sh
Content-Type: application/json
access-token: jUJncRrngRCMCf...
```

body

```sh
{
    "token":"dRGha1saSi62i8S5Q6...",
    "title":"Hello Wi - bu!",
    "body": "Yo, this is your waifu.",
    "image":"https://i.pinimg.com/474x/8c/46/22/8c4622b18c2f21da2e3e09ddde3ade9e.jpg" //opsional
    "data": {
        "payload":"payload-key"   // opsional key n value
    }
}

```
