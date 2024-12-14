# API Endpoint Documentation

This repository contains a simple Node.js Express application for managing API endpoints related to generating and validating secret keys based on hardware identifiers (HWID).

## API Endpoints

### 1. Generate Key

- **Endpoint:** `/generateKey`
- **Method:** `GET`
- **Description:** Generates a new secret key based on the user's hardware identifier (HWID) or retrieves an existing key if one already exists for the HWID.
- **Response:**
  ```json
  {
    "secretKey": "generated_key",
    "hwid": "user_hwid"
  }
  ```

### 2. Validate Key

- **Endpoint:** `/validateKey/:key`
- **Method:** `GET`
- **Description:** Validates if the provided key is associated with any HWID.
- **Parameters:**
  - `key` (string): The secret key to validate.
- **Response:**
  ```json
  {
    "valid": true
  }
  ```
  or
  ```json
  {
    "valid": false
  }
  ```

### 3. Retrieve Key

- **Endpoint:** `/retrieveKey`
- **Method:** `GET`
- **Description:** Retrieves the secret key associated with the current user's HWID.
- **Response:**
  ```json
  {
    "key": "user_key"
  }
  ```

## Dependencies

- [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js.
- [fingerprintjs2](https://www.npmjs.com/package/fingerprintjs2): Modern & flexible browser fingerprint library.

## Notes

- Keys are generated randomly and associated with the user's HWID.
- Keys expire after 24 hours.
- HWID is determined based on the user-agent header, excluding plugins.

Feel free to customize and extend this code to fit your specific requirements. If you have any questions or issues, please open an [issue](https://github.com/AdvanceFTeam/HWID-Key-System/issues).
