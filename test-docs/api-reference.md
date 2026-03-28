# API Reference

## Endpoints

### GET /v1/kv/{key}

Returns the value stored at the specified key path.

**Parameters:**
- `key` (string): The key path to retrieve
- `recurse` (bool): If true, returns all keys with the given prefix
- `raw` (bool): Returns raw value without metadata
- `dc` (string): Datacenter to query
- `index` (int): Used for blocking queries
- `wait` (string): Duration to wait for change
- `token` (string): ACL token

**Response codes:**
- 200: Key exists
- 404: Key not found
- 403: Permission denied
- 500: Internal error

### PUT /v1/kv/{key}

Stores a value at the specified key path.

**Parameters:**
- `key` (string): The key path
- `flags` (int): Integer value associated with this key
- `cas` (int): Check-and-set operation index
- `acquire` (string): Session ID to acquire lock
- `release` (string): Session ID to release lock
- `token` (string): ACL token

### DELETE /v1/kv/{key}

Deletes the key at the specified path. Use `recurse=true` to delete all keys with the given prefix.
