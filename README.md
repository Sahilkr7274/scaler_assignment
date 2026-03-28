# Trello Clone — Scaler SDE Intern Assignment

A full-stack Trello-like project management tool built with Next.js, Node.js/Express, Prisma, and PostgreSQL.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14 (App Router) + TypeScript |
| Styling   | Tailwind CSS                        |
| Drag & Drop | @hello-pangea/dnd                 |
| Backend   | Node.js + Express.js                |
| ORM       | Prisma                              |
| Database  | PostgreSQL                          |

## Features

### Core (Must Have)
- ✅ Create, view, and delete boards with custom background colors
- ✅ Create, edit, delete, and drag-and-drop reorder lists
- ✅ Create, edit, delete cards with title and description
- ✅ Drag and drop cards between lists and within a list
- ✅ Card labels (colored tags) — add/remove
- ✅ Card due dates
- ✅ Checklists with items — add, toggle, delete
- ✅ Assign/remove members on cards
- ✅ Comments and activity log on cards
- ✅ Search cards by title, filter by label/member

### Bonus
- ✅ Card cover colors
- ✅ Multiple boards support
- ✅ Board background customization
- ✅ Archive cards

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a cloud DB)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd trello-clone
npm run install:all
```

### 2. Configure Backend

Edit `backend/.env`:
```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/trello_clone"
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### 3. Configure Frontend

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Run Database Migrations

```bash
# Create the database first in psql:
# CREATE DATABASE trello_clone;

npm run db:migrate
npm run db:seed
```

### 5. Start Development Servers

In two separate terminals:

```bash
# Terminal 1 — Backend (port 4000)
npm run dev:backend

# Terminal 2 — Frontend (port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

```
Board → Lists → Cards
Cards → Labels (many-to-many)
Cards → Members (many-to-many)
Cards → Checklists → ChecklistItems
Cards → Comments
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/boards | List all boards |
| POST | /api/boards | Create board |
| GET | /api/boards/:id | Get board with lists & cards |
| PATCH | /api/boards/:id | Update board |
| DELETE | /api/boards/:id | Delete board |
| POST | /api/lists | Create list |
| PATCH | /api/lists/:id | Update list |
| PATCH | /api/lists/reorder/batch | Reorder lists |
| DELETE | /api/lists/:id | Delete list |
| POST | /api/cards | Create card |
| GET | /api/cards/:id | Get card details |
| PATCH | /api/cards/:id | Update card |
| PATCH | /api/cards/reorder/batch | Move/reorder cards |
| DELETE | /api/cards/:id | Delete card |
| POST | /api/cards/:id/labels | Add label |
| DELETE | /api/cards/:id/labels/:labelId | Remove label |
| POST | /api/cards/:id/members | Assign member |
| DELETE | /api/cards/:id/members/:memberId | Remove member |
| POST | /api/cards/:id/checklists | Add checklist |
| POST | /api/cards/:id/checklists/:clId/items | Add item |
| PATCH | /api/cards/:id/checklists/:clId/items/:itemId | Toggle item |
| POST | /api/cards/:id/comments | Add comment |
| GET | /api/cards/search/query | Search & filter cards |

## Deployment

### Backend (Railway / Render)
1. Set `DATABASE_URL` environment variable
2. Run `npm run db:generate && npm start`

### Frontend (Vercel)
1. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
2. Deploy with `vercel --prod`

## Assumptions
- No authentication required — a default user "Alice Johnson" is assumed logged in
- Sample data is seeded via `npm run db:seed`
- Labels are pre-seeded (Bug, Feature, Design, Urgent, Backend)
