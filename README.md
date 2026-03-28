# Trello Clone — Full-Stack Kanban Board

A production-ready Trello-like project management application built as part of the Scaler SDE Intern assignment. Supports boards, lists, and cards with full drag-and-drop, card details, labels, members, checklists, comments, and search.

**Live Demo**
- Frontend: [https://scaler-assignment.vercel.app](https://scaler-assignment.vercel.app) *(placeholder)*
- Backend API: [https://scaler-assignment-api.onrender.com](https://scaler-assignment-api.onrender.com) *(placeholder)*

---

## Features

### Board Management
- Create boards with custom background colors
- View all boards on a home dashboard
- Edit board title inline
- Delete boards (cascades to all lists and cards)

### List Management
- Create, rename, and delete lists
- Drag and drop to reorder lists horizontally
- Positions persisted to the database

### Card Management
- Create, edit, and delete cards
- Drag and drop cards within a list and across lists
- Archive / unarchive cards
- Card cover colors

### Card Details (Modal)
- Edit title and description
- Add / remove color-coded labels
- Assign / remove members
- Set due dates (overdue and today highlighted)
- Checklists with add, toggle, and delete items — progress bar
- Comments with author and timestamp
- Activity log

### Search & Filter
- Search cards by title (debounced, no API hammering)
- Filter by label, member, or due date
- Results show list and board context

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @hello-pangea/dnd |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Deployment (FE) | Vercel |
| Deployment (BE) | Render / Railway |

---

## Project Structure

```
scalar_assignment/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Sample data seeder
│   ├── src/
│   │   ├── routes/
│   │   │   ├── boards.js
│   │   │   ├── lists.js
│   │   │   ├── cards.js
│   │   │   ├── labels.js
│   │   │   └── members.js
│   │   ├── index.js            # Express app entry point
│   │   └── prisma.js           # Prisma client singleton
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Home — board listing
│   │   └── boards/[id]/
│   │       └── page.tsx        # Board view with DnD
│   ├── components/
│   │   ├── board/
│   │   │   ├── ListColumn.tsx
│   │   │   ├── CardItem.tsx
│   │   │   ├── AddList.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── BoardBgPicker.tsx
│   │   └── card/
│   │       └── CardModal.tsx
│   ├── context/
│   │   └── CurrentUserContext.tsx
│   ├── lib/
│   │   └── api.ts              # All API calls (Axios)
│   └── types/
│       └── index.ts            # Shared TypeScript types
└── package.json                # Root scripts
```

---

## Database Schema

```
Board
  └── List (position: Float, boardId)
        └── Card (position: Float, listId, dueDate, archived, cover)
              ├── CardLabel  ──→ Label (many-to-many)
              ├── CardMember ──→ Member (many-to-many)
              ├── Checklist
              │     └── ChecklistItem
              ├── Comment
              ├── ActivityLog
              └── Attachment
```

All foreign keys use `onDelete: Cascade` so deleting a board removes all its lists, cards, and related data automatically.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards` | List all boards |
| POST | `/api/boards` | Create a board |
| GET | `/api/boards/:id` | Get board with lists & cards |
| PATCH | `/api/boards/:id` | Update board title / background |
| DELETE | `/api/boards/:id` | Delete board |
| POST | `/api/lists` | Create list |
| PATCH | `/api/lists/reorder/batch` | Reorder lists |
| PATCH | `/api/lists/:id` | Update list title |
| DELETE | `/api/lists/:id` | Delete list |
| POST | `/api/cards` | Create card |
| GET | `/api/cards/search/query` | Search & filter cards |
| PATCH | `/api/cards/reorder/batch` | Move / reorder cards |
| GET | `/api/cards/:id` | Get card details |
| PATCH | `/api/cards/:id` | Update card |
| DELETE | `/api/cards/:id` | Delete card |
| POST | `/api/cards/:id/labels` | Add label to card |
| DELETE | `/api/cards/:id/labels/:labelId` | Remove label |
| POST | `/api/cards/:id/members` | Assign member |
| DELETE | `/api/cards/:id/members/:memberId` | Remove member |
| POST | `/api/cards/:id/checklists` | Add checklist |
| DELETE | `/api/cards/:id/checklists/:clId` | Delete checklist |
| POST | `/api/cards/:id/checklists/:clId/items` | Add checklist item |
| PATCH | `/api/cards/:id/checklists/:clId/items/:itemId` | Toggle / edit item |
| DELETE | `/api/cards/:id/checklists/:clId/items/:itemId` | Delete item |
| POST | `/api/cards/:id/comments` | Add comment |
| DELETE | `/api/cards/:id/comments/:commentId` | Delete comment |
| GET | `/api/members` | List all members |
| GET | `/api/labels` | List all labels |

---

## Environment Variables

### Backend — `backend/.env`

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/trello_clone"
PORT=4000
FRONTEND_URL=http://localhost:3000
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or a cloud DB like Supabase / Railway)

### 1. Clone the repository

```bash
git clone https://github.com/Sahilkr7274/scalar_assignment.git
cd scalar_assignment
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials

# Frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > frontend/.env.local
```

### 4. Set up the database

```bash
# Create the database in psql first:
# CREATE DATABASE trello_clone;

npm run db:migrate   # runs prisma migrate dev
npm run db:seed      # seeds boards, lists, cards, members, labels
```

### 5. Start development servers

```bash
# Terminal 1 — Backend (port 4000)
npm run dev:backend

# Terminal 2 — Frontend (port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000)

---

## Seed Data

Running `npm run db:seed` creates:

- **3 boards**: Trello Clone Project, Marketing Campaign, Personal Tasks
- **5 members**: Alice Johnson (default logged-in user), Bob Smith, Carol White, David Lee, Eva Martinez
- **5 labels**: Bug, Feature, Design, Urgent, Backend
- Sample cards with checklists, comments, labels, members, and due dates pre-assigned

> No authentication is required. Alice Johnson is assumed as the logged-in user per the assignment spec.

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
5. Deploy

### Backend → Render

1. Create a new **Web Service** in [render.com](https://render.com)
2. Set root directory to `backend`
3. Build command: `npm install && npx prisma generate`
4. Start command: `node src/index.js`
5. Add environment variables: `DATABASE_URL`, `PORT=4000`, `FRONTEND_URL=https://your-frontend.vercel.app`

### Database → Railway / Supabase

Provision a PostgreSQL instance, copy the connection string into `DATABASE_URL`, then run:

```bash
cd backend && npx prisma migrate deploy && node prisma/seed.js
```

---

## Available Scripts

From the root directory:

| Command | Description |
|---|---|
| `npm run install:all` | Install dependencies for both backend and frontend |
| `npm run dev:backend` | Start backend dev server (nodemon, port 4000) |
| `npm run dev:frontend` | Start frontend dev server (Next.js, port 3000) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:generate` | Regenerate Prisma client after schema changes |

---

## Assumptions

- No authentication — Alice Johnson is the default logged-in user
- Labels are pre-seeded and shared across all boards
- File attachments are stored locally in `backend/uploads/` (use S3 in production)
