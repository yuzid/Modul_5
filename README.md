# Modul_5

Repositori ini sekarang dibagi menjadi dua proyek:

- `frontend-portal`
- `backend-portal`

Terdapat juga `Dockerfile` di root untuk membangun kedua aplikasi dalam satu image. Backend akan membangun frontend terlebih dahulu, lalu melayani hasil build statis dari Express.

## Build dan jalankan dengan Docker root

```bash
cd /home/ledd/backend-portal
docker build -t portal-fullstack .
docker run --rm -p 5000:5000 --env-file backend-portal/.env portal-fullstack
```

Frontend akan tersedia di `http://localhost:5000` dan backend API di `http://localhost:5000/register`.
