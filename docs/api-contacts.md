# /api/contacts

Endpoint ini digunakan untuk mengelola data kontak pengguna chatbot.

## POST /api/contacts

Membuat kontak baru atau mengembalikan kontak yang sudah ada jika nomor telepon sudah terdaftar.

### Headers

```json
{
  "X-API-Key": "your-api-key",
  "Content-Type": "application/json"
}
```

### Body

```json
{
  "phone_number": "081234567890"
}
```

### Validation Rules

- `phone_number`: String, 5-20 karakter, wajib diisi

### Response Success (201 - Contact Created)

```json
{
  "success": true,
  "id": 123
}
```

### Response Success (200 - Contact Already Exists)

```json
{
  "success": true,
  "id": 123,
  "existed": true
}
```

## GET /api/contacts/:phone_number

Mendapatkan data kontak berdasarkan nomor telepon.

### Headers

```json
{
  "X-API-Key": "your-api-key"
}
```

### Parameters

- `phone_number` (path): Nomor telepon kontak yang dicari

### Response Success (200)

```json
{
  "id": 123,
  "phone_number": "081234567890",
  "created_at": "2025-01-20 10:30:45"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "type": "field",
      "value": "123",
      "msg": "Invalid value",
      "path": "phone_number",
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
  "error": "Contact not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create contact"
}
```

atau

```json
{
  "error": "Failed to fetch contact"
}
```
