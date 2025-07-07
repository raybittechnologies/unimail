# IMAP/SMTP Email Integration

This document explains how to use the new generic IMAP/SMTP email functionality in RoboMailer.

## Overview

The IMAP integration allows you to send emails through any SMTP server, not just OAuth providers. This is useful for:

- Custom email servers
- Corporate email systems
- Email providers that don't support OAuth
- Legacy email systems

## Setup

### 1. Configure IMAP Settings

First, you need to configure your SMTP settings for a user:

```bash
POST /auth/imap-config/:userId
Content-Type: application/json

{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_username": "your-email@gmail.com",
  "smtp_password": "your-app-password",
  "smtp_secure": false,
  "smtp_require_tls": true
}
```

### 2. Verify Connection

Test your SMTP connection:

```bash
GET /verify-imap/:userId
```

### 3. Send Email

Send emails using the configured SMTP server:

```bash
POST /send-email-imap
Content-Type: application/json

{
  "id": "user-uuid",
  "to": "recipient@example.com",
  "subject": "Test Email",
  "message": "<h1>Hello World</h1><p>This is a test email.</p>",
  "options": {
    "cc": "cc@example.com",
    "bcc": "bcc@example.com"
  }
}
```

## Common SMTP Settings

### Gmail

```json
{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_secure": false,
  "smtp_require_tls": true
}
```

### Outlook/Hotmail

```json
{
  "smtp_host": "smtp-mail.outlook.com",
  "smtp_port": 587,
  "smtp_secure": false,
  "smtp_require_tls": true
}
```

### Yahoo

```json
{
  "smtp_host": "smtp.mail.yahoo.com",
  "smtp_port": 587,
  "smtp_secure": false,
  "smtp_require_tls": true
}
```

### Custom Server

```json
{
  "smtp_host": "mail.yourcompany.com",
  "smtp_port": 587,
  "smtp_secure": false,
  "smtp_require_tls": true
}
```

## API Endpoints

### IMAP Configuration Management

- `POST /auth/imap-config/:id` - Save IMAP configuration
- `GET /auth/imap-config/:id` - Get IMAP configuration
- `DELETE /auth/imap-config/:id` - Delete IMAP configuration

### Email Operations

- `POST /send-email-imap` - Send email via IMAP/SMTP
- `GET /verify-imap/:id` - Verify SMTP connection

## Security Notes

1. **App Passwords**: For Gmail and other providers, use app passwords instead of your regular password
2. **TLS**: Always enable TLS for secure email transmission
3. **Credentials**: Store credentials securely and never expose them in logs
4. **Port Security**: Use standard SMTP ports (587 for STARTTLS, 465 for SSL)

## Error Handling

The system provides detailed error messages for common issues:

- Invalid SMTP configuration
- Authentication failures
- Connection timeouts
- Invalid email addresses

## Database Schema

The following fields have been added to the `users` table:

- `smtp_host` - SMTP server hostname
- `smtp_port` - SMTP server port
- `smtp_username` - SMTP username (usually email)
- `smtp_password` - SMTP password or app password
- `smtp_secure` - Whether to use SSL/TLS
- `smtp_require_tls` - Whether to require TLS

## Migration

Run the database sync to add the new fields:

```bash
node sync.js
```

This will add the new IMAP fields to your existing users table without affecting existing data.
