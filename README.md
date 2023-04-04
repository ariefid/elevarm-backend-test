# Elevarm Backend Test

## Overview

Di dalam repository ini, saya implementasi dua service yaitu User dan GoRide. Menggunakan arsitektur monolith dan monorepo tools.

GoRide service menangani pemesanan layanan GoRide. User service menangani layanan Login, Daftar dan Profil.

Untuk jawaban tentang berapa banyak service yang ada di GoJek. Saya pikir ada layanan lain selain pengguna, GoRide. Setiap fitur yang dimiliki GoJek, diimplementasikan sebagai layanan yang berbeda. Misalnya GoRide, GoCar, GoPay, GoPulsa, GoMed, dan masih banyak lainnya.

## User

### Model
1. User Model dengan struktur data
    1. _id: ObjectId
    2. username: string
    3. pin: string
    4. phone: string
    5. createdAt: Date
    6. updateAt: Date

### Catatan
PIN disimpan kedalam database menggunakan bcrypt.

## GoRide

### Model

2. Transaction Model dengan struktur data
    1. _id: ObjectId
    2. userId: ObjectId
    3. serviceFrom: Enum
    4. detail: string[]
    5. createdAt: Date
    6. updateAt: Date

## Tech Stack

Dibawah ini merupakan Tech Stack yang saya gunakan:

1. RushJS [https://rushjs.io/](https://rushjs.io/)
2. ExpressJS
3. MongoDB
4. Mikro-ORM
5. morgan
6. routing-controllers
7. jsonwebtoken
8. bcrypt

## Instalasi

1. Install pnpm
    ```sh
    $ npm install -g pnpm
    ```
2. Install rush 
    ```sh
    $ npm install -g @microsoft/rush
    ```
3. Clone repository
    ```sh
    $ git clone https://github.com/ariefid/elevarm-backend-test.git
    ```
4. Update monorepo dengan rush
    ```sh
    $ cd elevarm-backend-test && rush update
    ```
5. Copy .env.example menjadi .env
    ```sh
    $ cd app && cp .env.example .env 
    ```
6. Sesuaikan isi file .env dengan koneksi MongoDB
   
7. Jalankan aplikasi di dalam folder "app" dengan perintah:
    ```sh
    $ pnpm dev
    ```
