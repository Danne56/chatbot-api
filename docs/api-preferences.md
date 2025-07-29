# /api/preferences

Endpoint ini digunakan untuk mengelola preferensi pengguna terkait opt-in/opt-out dan status intro harian.

## POST /api/preferences/opt-in

Menandai pengguna sebagai opt-in (menyetujui untuk menerima pesan).

### Request Headers

```json
{
  "X-API-Key": "your-api-key",
  "Content-Type": "application/json"
}
```

### Body

```json
{
  "contact_id": 123
}
```

### Validation Rules

- `contact_id`: Integer, minimal 1, wajib diisi

### Response Success (200)

```json
{
  "success": true
}
```

## POST /api/preferences/opt-out

Menandai pengguna sebagai opt-out (tidak ingin menerima pesan).

### Request Headers

```json
{
  "X-API-Key": "your-api-key",
  "Content-Type": "application/json"
}
```

### Body

```json
{
  "contact_id": 123
}
```

### Validation Rules

- `contact_id`: Integer, minimal 1, wajib diisi

### Response Success (200)

```json
{
  "success": true
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
  "id": 1,
  "contact_id": 123,
  "has_opted_in": 1,
  "awaiting_optin": 0,
  "intro_sent_today": 0,
  "opted_in_at": "2025-01-20 10:30:45",
  "opted_out_at": null,
  "created_at": "2025-01-20 09:15:30",
  "updated_at": "2025-01-20 10:30:45"
}
```

## POST /api/preferences/intro-sent

Menandai bahwa intro harian sudah dikirim ke pengguna.

### Request Headers

```json
{
  "X-API-Key": "your-api-key",
  "Content-Type": "application/json"
}
```

### Body

```json
{
  "contact_id": 123
}
```

### Validation Rules

- `contact_id`: Integer, minimal 1, wajib diisi

### Response Success (200)

```json
{
  "success": true
}
```

## POST /api/preferences/reset

Reset flag intro harian untuk semua pengguna (biasanya dipanggil via cron job setiap hari).

### Request Headers

```json
{
  "X-API-Key": "your-api-key",
  "Content-Type": "application/json"
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

### 400 Bad Request - Validation Error

```json
{
  "errors": [
    {
      "type": "field",
      "value": "abc",
      "msg": "Invalid value",
      "path": "contact_id",
      "location": "body"
    }
  ]
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
  "error": "Preferences not found"
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

- Semua operasi POST menggunakan `INSERT ... ON DUPLICATE KEY UPDATE` untuk upsert data
- Field `has_opted_in`: 1 untuk opt-in, 0 untuk opt-out
- Field `awaiting_optin`: Reset ke 0 saat opt-in/opt-out
- Field `intro_sent_today`: Flag untuk mencegah pengiriman intro berulang dalam satu hari
- Timestamps `opted_in_at` dan `opted_out_at` diperbarui sesuai aksi pengguna
