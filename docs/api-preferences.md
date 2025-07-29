# /api/preferences

Endpoint ini digunakan untuk mengelola preferensi pengguna terkait opt-in/opt-out dan status intro harian.

## PUT /api/preferences/:contact_id/opt-in

Menandai pengguna sebagai opt-in (menyetujui untuk menerima pesan).

### Request Headers

```json
{
  "X-API-Key": "your-api-key"
}
```

### Parameters

- `contact_id` (path): ID kontak yang akan di-opt-in

### Response Success (200)

```json
{
  "success": true,
  "message": "Contact opted in successfully"
}
```

## PUT /api/preferences/:contact_id/opt-out

Menandai pengguna sebagai opt-out (tidak ingin menerima pesan).

### Request Headers

```json
{
  "X-API-Key": "your-api-key"
}
```

### Parameters

- `contact_id` (path): ID kontak yang akan di-opt-out

### Response Success (200)

```json
{
  "success": true,
  "message": "Contact opted out successfully"
}
```

## GET /api/preferences/:contact_id

Mendapatkan preferensi pengguna berdasarkan contact ID.

### Request Headers

```json
{
  "X-API-Key": "your-api-key"
}
```

### Parameters

- `contact_id` (path): ID kontak yang dicari

### Response Success (200)

```json
{
  "id": "pref_a1b2c3d4e5f6",
  "contact_id": "a1b2c3d4e5f6",
  "has_opted_in": 1,
  "awaiting_optin": 0,
  "intro_sent_today": 0,
  "opted_in_at": "2025-01-20 10:30:45",
  "opted_out_at": null,
  "created_at": "2025-01-20 09:15:30",
  "updated_at": "2025-01-20 10:30:45"
}
```

## PUT /api/preferences/:contact_id/intro-sent

Menandai bahwa intro harian sudah dikirim ke pengguna.

### Request Headers

```json
{
  "X-API-Key": "your-api-key"
}
```

### Parameters

- `contact_id` (path): ID kontak yang telah dikirimi intro

### Response Success (200)

```json
{
  "success": true,
  "message": "Intro status updated successfully"
}
```

## POST /api/preferences/reset

Reset flag intro harian untuk semua pengguna (biasanya dipanggil via cron job setiap hari).

### Request Headers

```json
{
  "X-API-Key": "your-api-key"
}
```

### Body

Tidak ada body yang diperlukan.

### Response Success (200)

```json
{
  "success": true,
  "message": "Reset intro flags for 150 users"
}
```

## Error Responses

### 400 Bad Request - Invalid Contact ID

```json
{
  "error": "Invalid contact_id"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "error": "Preferences not found for contact_id: a1b2c3d4e5f6"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to update preference"
}
```

atau

```json
{
  "error": "Failed to fetch preferences"
}
```

atau

```json
{
  "error": "Failed to update intro status"
}
```

atau

```json
{
  "error": "Failed to reset intro flags"
}
```

## Database Behavior

- Operasi PUT hanya akan memperbarui preferensi untuk kontak yang sudah ada. Jika preferensi belum ada, maka akan gagal.
- Field `has_opted_in`: 1 untuk opt-in, 0 untuk opt-out
- Field `awaiting_optin`: Reset ke 0 saat opt-in/opt-out
- Field `intro_sent_today`: Flag untuk mencegah pengiriman intro berulang dalam satu hari
- Timestamps `opted_in_at` dan `opted_out_at` diperbarui sesuai aksi pengguna
