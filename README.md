# Ajaia Docs

A lightweight, AI-native document editor inspired by Google Docs. Create, edit, organize, import, and share documents with simple access permissions.

## Features

- User registration and login with JWT authentication
- Create, rename, edit, and delete documents
- Rich-text editing with headings, bold, italic, underline, and lists
- Automatic document saving
- Import text files (`.txt`)
- Share documents with other registered users
- View and edit permissions for shared documents
- Separate ownership and sharing permissions
- PostgreSQL database persistence

## Tech Stack

**Frontend**
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Tiptap Editor
- Lucide React

**Backend**
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs

## Project Structure

```text
ajaia-docs/
├── client/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
├── server/
│   ├── prisma/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
├── README.md
├── ARCHITECTURE.md
├── AI_WORKFLOW.md
└── SUBMISSION.md
```

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/nayeem-94/ajaia-docs.git
cd ajaia-docs
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/ajaia_docs"
JWT_SECRET="your-secure-secret-key"
CLIENT_URL="http://localhost:5173"
```

Create the PostgreSQL database named `ajaia_docs`, then run:

```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

Backend runs at `http://localhost:5000`.

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Running Tests

From the `server` directory:

```bash
npm test
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/documents` | List accessible documents |
| POST | `/api/documents` | Create a document |
| GET | `/api/documents/:id` | Get a document |
| PUT | `/api/documents/:id` | Update a document |
| DELETE | `/api/documents/:id` | Delete a document |
| POST | `/api/shares/:id` | Share a document |
| GET | `/api/shares/:id` | List document shares |
| DELETE | `/api/shares/:id/:shareId` | Remove access |

Protected endpoints require a valid JWT access token.

## Security and Permissions

- Passwords are hashed using bcrypt.
- JWT authentication protects private API endpoints.
- Document owners can manage sharing permissions.
- Shared users can only view or edit documents according to their assigned permission.
- Only owners can delete their documents.

## License

This project was developed as a technical assessment for jaia LLC.
