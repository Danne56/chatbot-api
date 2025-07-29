# /api/messages

Endpoint ini digunakan untuk mencatat pesan masuk dan keluar dalam chatbot.

## POST /api/messages

Mencatat pesan masuk dari pengguna dan pesan keluar (response) dari chatbot.

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
  "contact_id": 123,
  "message_in": "Halo, saya butuh bantuan",
  "message_out": "Halo! Terima kasih telah menghubungi kami. Bagaimana saya bisa membantu Anda?"
}
```

### Validation Rules

- `contact_id`: Integer, minimal 1, wajib diisi
- `message_in`: String, tidak boleh kosong, wajib diisi
- `message_out`: String, opsional

### Response Success (201)

```json
{
  "success": true
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
      "value": "",
      "msg": "Invalid value",
      "path": "message_in",
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

### 500 Internal Server Error

```json
{
  "error": "Failed to log message"
}
```

## Notes

- Endpoint ini memverifikasi bahwa `contact_id` yang diberikan benar-benar ada dalam tabel `contacts`
- Field `message_out` bersifat opsional, jika tidak diberikan akan disimpan sebagai `null`
- Timestamp akan otomatis dibuat saat pesan dicatat
