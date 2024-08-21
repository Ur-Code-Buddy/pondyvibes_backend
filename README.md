# PondyVibes Backend

This is the backend for the PondyVibes application, built using the Hono framework, specifically designed for Cloudflare Workers.

## Overview

This backend provides the following functionalities:
- **CORS Middleware**: Applied globally to allow cross-origin requests.
- **Admin Login**: Verifies admin credentials stored in Cloudflare's KV storage.
- **Content Management**: 
  - Store content using a `POST` request with admin authentication.
  - Retrieve stored content with a `GET` request.
- **Status Check**: Endpoint to check if the server is running.
- **Send Message**: Sends a booking request email with custom HTML formatting via the Resend API.

## Endpoints

- `GET /status`: Check server status.
- `GET /`: Base endpoint providing a simple message.
- `POST /store_content`: Stores content with admin authentication.
- `GET /get_content`: Retrieves stored content.
- `GET /login`: Verifies admin credentials.
- `POST /send_message`: Sends a formatted email using the Resend API.

## Why Hono?

Hono is used instead of Express due to its lightweight design, making it ideal for Cloudflare Workers. This enables faster response times and better performance on serverless environments.

## Environment Variables

- **USERS_KV**: Cloudflare KV namespace for storing admin credentials.
- **CONTENT_KV**: Cloudflare KV namespace for storing content.
- **Resend API Key**: `re_jhHk6Ar7_DxmMo34uAt1z2avpqbFzx6YJ` used for sending emails via Resend.

## Deployment

This backend is designed to be deployed on Cloudflare Workers.

## License

This project is licensed under the MIT License.
