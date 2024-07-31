# Secure File Sharing Service

A backend service for secure file sharing, built using Node.js, Express, Prisma, PostgreSQL, Redis, JWT authentication,
and file upload functionality. This service allows users to securely upload, manage, and share files with time-limited
links.

## Table of Contents

1. [Project Description](#project-description)
2. [Features](#features)
3. [Technologies](#technologies)
4. [Setup and Installation](#setup-and-installation)
5. [Environment Variables](#environment-variables)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)

## Project Description

The Secure File Sharing Service is a Node.js backend application designed for secure file storage and sharing. Users can
upload files, which are then stored on the server and linked to their accounts. Each file can be shared with others via
a unique, time-limited link, providing an additional layer of security.

The service includes email confirmation for users before allowing file uploads, caching for file paths to optimize
performance, and comprehensive error handling.

## Features

- **User Authentication**: Register and login with JWT authentication. Includes email confirmation before activating
  accounts.
- **File Upload**: Securely upload files to the server with encryption.
- **File Management**: View and manage files, including generating and sharing secure links.
- **File Sharing**: Generate time-limited links for sharing files.
- **Caching**: Use Redis to cache file paths to improve performance.
- **Validation**: Use Joi for validating user inputs.
- **Security**: Enhance security with Helmet and prevent spam attacks with Express Rate Limiter.
- **Password Management**: Secure password storage with bcrypt hashing.
- **Token Management**: Use `jsonwebtoken` for validating JWTs used in authentication, file access, and email
  confirmation.

## Technologies

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express**: Web framework for building RESTful APIs.
- **Prisma**: ORM for managing PostgreSQL databases.
- **PostgreSQL**: Relational database system.
- **Redis**: In-memory data structure store for caching file paths.
- **JWT**: JSON Web Tokens for user authentication.
- **Multer**: Middleware for handling file uploads.
- **bcrypt**: Library for hashing passwords.
- **Nodemailer**: Module for sending email confirmation links.
- **Joi**: Validation library for user inputs.
- **Helmet**: Middleware for securing Express apps by setting various HTTP headers.
- **Express Rate Limiter**: Middleware for rate-limiting requests to prevent abuse.
- **jsonwebtoken**: Library for managing JWTs, including validation for user authentication, file access, and email
  confirmation.

## Setup and Installation

### Prerequisites

- Node.js and npm installed
- PostgreSQL server running
- Redis server running

### Clone the Repository

```bash
git clone https://github.com/sujoy-kr/fileShare
cd fileShare
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root of the project with the following content:

```
PORT=3000
DATABASE_URL="username://password:postgres@localhost:5432/database_name"
SALT_ROUND=15
JWT_SECRET=sujoykr
HOST_LINK=localhost:3000
NODEMAILER_EMAIL=email@domain.com
NODEMAILER_PASS="wkkb flvk hasd lkjw" // google account app password https://myaccount.google.com/apppasswords
```

### Run Migrations

Apply the Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev
```

### Start the Server

```bash
npm start
```

or for nodemon:

```bash
npm run dev
```

The server will run on `http://localhost:3000`.

## Database Schema

### User

- `id`: Integer, Primary Key, Auto Increment
- `email`: String, Unique
- `password`: String
- `createdAt`: DateTime, Default now
- `files`: Relation to `File` (One-to-Many)
- `emailConfirmed`: Boolean, Default false
- `confirmationToken`: String, Nullable

### File

- `id`: Integer, Primary Key, Auto Increment
- `userId`: Integer, Foreign Key to User
- `fileName`: String
- `fileUrl`: String
- `createdAt`: DateTime, Default now
- `User`: Relation to `User`

## API Endpoints

### Authentication Routes

- **POST api/auth/register**
    - **Description**: Register a new user.
    - **Request Body**: `{ "email": "user@example.com", "password": "securepassword" }`

- **POST api/auth/login**
    - **Description**: Authenticate a user and return a JWT.
    - **Request Body**: `{ "email": "user@example.com", "password": "securepassword" }`

- **GET api/auth/confirm/:token**
    - **Description**: Confirms email address and activates account.

### File Management Routes

- **POST /api/file/**
    - **Description**: Upload a new file.
    - **Request Body**: Form-data with `file` and `fileName`

- **GET /api/file/:id/get-link**
    - **Description**: Get a sharable link for a file.
    - **Response**: `{
      "sharableLink": "localhost:3000/share/token"}`

- **DELETE /api/file/:id**
    - **Description**: Delete a file.

### User Routes

- **GET /api/user/profile**
    - **Description**: Get user data via token through Authorization header.
    - **Request Body**: Form-data with `file` and `fileName`
    - **Response**: `{
      "id": 35,
      "email": "thesujoykr@gmail.com",
      "files": [
      {
      "id": 43,
      "fileName": "sdfsd777",
      "createdAt": "2024-07-31T06:23:48.219Z"
      },
      {
      "id": 44,
      "fileName": "sdfsd777",
      "createdAt": "2024-07-31T06:25:47.767Z"
      }
      ]
      }`


- **DELETE /api/user/delete**
    - **Description**: Delete a user data via token through Authorization header.

### Share Routes

- **GET /share/:token/**
    - **Description**: Gets the file associated with the token.

