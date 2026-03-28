require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Members ──────────────────────────────────────────────────────────────
  // Alice is the default logged-in user (no auth required per assignment)
  const alice = await prisma.member.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice Johnson', email: 'alice@example.com', avatar: 'AJ' },
  });
  const bob = await prisma.member.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: { name: 'Bob Smith', email: 'bob@example.com', avatar: 'BS' },
  });
  const carol = await prisma.member.upsert({
    where: { email: 'carol@example.com' },
    update: {},
    create: { name: 'Carol White', email: 'carol@example.com', avatar: 'CW' },
  });
  const david = await prisma.member.upsert({
    where: { email: 'david@example.com' },
    update: {},
    create: { name: 'David Lee', email: 'david@example.com', avatar: 'DL' },
  });
  const eva = await prisma.member.upsert({
    where: { email: 'eva@example.com' },
    update: {},
    create: { name: 'Eva Martinez', email: 'eva@example.com', avatar: 'EM' },
  });

  console.log(`✅ Members seeded: ${alice.name}, ${bob.name}, ${carol.name}, ${david.name}, ${eva.name}`);

  // ── Labels ────────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.label.upsert({ where: { id: 'label-bug' },     update: {}, create: { id: 'label-bug',     name: 'Bug',     color: '#EB5A46' } }),
    prisma.label.upsert({ where: { id: 'label-feature' }, update: {}, create: { id: 'label-feature', name: 'Feature', color: '#61BD4F' } }),
    prisma.label.upsert({ where: { id: 'label-design' },  update: {}, create: { id: 'label-design',  name: 'Design',  color: '#C377E0' } }),
    prisma.label.upsert({ where: { id: 'label-urgent' },  update: {}, create: { id: 'label-urgent',  name: 'Urgent',  color: '#FF9F1A' } }),
    prisma.label.upsert({ where: { id: 'label-backend' }, update: {}, create: { id: 'label-backend', name: 'Backend', color: '#0079BF' } }),
  ]);

  console.log('✅ Labels seeded');

  // ── Board 1: Trello Clone Project ─────────────────────────────────────────
  const board1 = await prisma.board.create({
    data: {
      title: 'Trello Clone Project',
      background: '#0079BF',
      lists: {
        create: [
          {
            title: 'Backlog',
            position: 1,
            cards: {
              create: [
                { title: 'Setup project repository',  position: 1, description: 'Initialize git repo and set up monorepo structure with frontend and backend folders.' },
                { title: 'Design database schema',    position: 2, description: 'Create ERD and Prisma schema for boards, lists, cards, members, labels.' },
                { title: 'Configure CI/CD pipeline',  position: 3 },
                { title: 'Write API documentation',   position: 4 },
              ],
            },
          },
          {
            title: 'In Progress',
            position: 2,
            cards: {
              create: [
                {
                  title: 'Build board REST API',
                  position: 1,
                  description: 'Implement all REST endpoints for boards, lists, cards including reorder batch endpoints.',
                  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                },
                {
                  title: 'Implement drag and drop',
                  position: 2,
                  description: 'Use @hello-pangea/dnd for smooth list and card reordering. Handle cross-list moves.',
                  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                },
                {
                  title: 'Card detail modal',
                  position: 3,
                  description: 'Build the card modal with labels, members, checklists, due date, comments and activity log.',
                },
              ],
            },
          },
          {
            title: 'Review',
            position: 3,
            cards: {
              create: [
                { title: 'UI component library setup', position: 1, description: 'Set up Tailwind CSS and shared component patterns.' },
                { title: 'Search and filter feature',  position: 2, description: 'Implement search by title and filter by label, member, due date.' },
              ],
            },
          },
          {
            title: 'Done',
            position: 4,
            cards: {
              create: [
                { title: 'Project planning',  position: 1, description: 'Define scope, tech stack and timeline.' },
                { title: 'Wireframes',        position: 2, description: 'Create wireframes for all major screens.' },
                { title: 'Tech stack decision', position: 3, description: 'Decided on Next.js + Express + Prisma + PostgreSQL.' },
              ],
            },
          },
        ],
      },
    },
    include: { lists: { include: { cards: true } } },
  });

  // ── Board 2: Marketing Campaign ───────────────────────────────────────────
  await prisma.board.create({
    data: {
      title: 'Marketing Campaign',
      background: '#519839',
      lists: {
        create: [
          { title: 'Ideas',       position: 1, cards: { create: [{ title: 'Social media strategy', position: 1 }, { title: 'Email newsletter', position: 2 }] } },
          { title: 'In Progress', position: 2, cards: { create: [{ title: 'Q1 blog posts', position: 1, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }] } },
          { title: 'Done',        position: 3, cards: { create: [{ title: 'Brand guidelines', position: 1 }] } },
        ],
      },
    },
  });

  // ── Board 3: Personal Tasks ───────────────────────────────────────────────
  await prisma.board.create({
    data: {
      title: 'Personal Tasks',
      background: '#B04632',
      lists: {
        create: [
          { title: 'To Do',       position: 1, cards: { create: [{ title: 'Read Clean Code book', position: 1 }, { title: 'Practice LeetCode', position: 2 }] } },
          { title: 'Doing',       position: 2, cards: { create: [{ title: 'Build portfolio site', position: 1 }] } },
          { title: 'Done',        position: 3, cards: { create: [{ title: 'Setup dev environment', position: 1 }] } },
        ],
      },
    },
  });

  console.log('✅ Boards seeded');

  // ── Assign labels + members to Board 1 cards ──────────────────────────────
  const inProgress = board1.lists.find(l => l.title === 'In Progress');
  const apiCard    = inProgress.cards.find(c => c.title === 'Build board REST API');
  const dndCard    = inProgress.cards.find(c => c.title === 'Implement drag and drop');
  const modalCard  = inProgress.cards.find(c => c.title === 'Card detail modal');

  const review     = board1.lists.find(l => l.title === 'Review');
  const searchCard = review.cards.find(c => c.title === 'Search and filter feature');

  await prisma.cardLabel.createMany({
    data: [
      { cardId: apiCard.id,    labelId: 'label-backend' },
      { cardId: apiCard.id,    labelId: 'label-feature' },
      { cardId: dndCard.id,    labelId: 'label-design'  },
      { cardId: dndCard.id,    labelId: 'label-feature' },
      { cardId: modalCard.id,  labelId: 'label-design'  },
      { cardId: modalCard.id,  labelId: 'label-feature' },
      { cardId: searchCard.id, labelId: 'label-feature' },
      { cardId: searchCard.id, labelId: 'label-urgent'  },
    ],
  });

  await prisma.cardMember.createMany({
    data: [
      { cardId: apiCard.id,    memberId: alice.id },
      { cardId: apiCard.id,    memberId: bob.id   },
      { cardId: dndCard.id,    memberId: carol.id },
      { cardId: dndCard.id,    memberId: david.id },
      { cardId: modalCard.id,  memberId: alice.id },
      { cardId: modalCard.id,  memberId: eva.id   },
      { cardId: searchCard.id, memberId: bob.id   },
    ],
  });

  // ── Checklist on API card ─────────────────────────────────────────────────
  await prisma.checklist.create({
    data: {
      title: 'API Endpoints',
      cardId: apiCard.id,
      items: {
        create: [
          { text: 'GET /boards',              completed: true  },
          { text: 'POST /boards',             completed: true  },
          { text: 'GET /boards/:id',          completed: true  },
          { text: 'POST /lists',              completed: false },
          { text: 'PATCH /lists/reorder',     completed: false },
          { text: 'POST /cards',              completed: false },
          { text: 'PATCH /cards/reorder',     completed: false },
          { text: 'POST /cards/:id/labels',   completed: false },
          { text: 'POST /cards/:id/members',  completed: false },
          { text: 'POST /cards/:id/comments', completed: false },
        ],
      },
    },
  });

  // ── Checklist on DnD card ─────────────────────────────────────────────────
  await prisma.checklist.create({
    data: {
      title: 'DnD Tasks',
      cardId: dndCard.id,
      items: {
        create: [
          { text: 'Install @hello-pangea/dnd', completed: true  },
          { text: 'Reorder lists',             completed: true  },
          { text: 'Reorder cards within list', completed: false },
          { text: 'Move cards between lists',  completed: false },
          { text: 'Persist order to backend',  completed: false },
        ],
      },
    },
  });

  // ── Sample comments ───────────────────────────────────────────────────────
  await prisma.comment.createMany({
    data: [
      { cardId: apiCard.id,   author: alice.name, text: 'Started working on the boards endpoint. Should be done by EOD.' },
      { cardId: apiCard.id,   author: bob.name,   text: 'Let me know if you need help with the Prisma queries.' },
      { cardId: dndCard.id,   author: carol.name, text: 'The @hello-pangea/dnd library looks great for this.' },
      { cardId: modalCard.id, author: alice.name, text: 'Referencing Trello\'s card modal design closely.' },
    ],
  });

  // ── Activity logs ─────────────────────────────────────────────────────────
  await prisma.activityLog.createMany({
    data: [
      { cardId: apiCard.id,   actor: alice.name, action: 'added this card' },
      { cardId: apiCard.id,   actor: alice.name, action: `added the "Backend" label` },
      { cardId: apiCard.id,   actor: alice.name, action: `added ${bob.name} to this card` },
      { cardId: apiCard.id,   actor: alice.name, action: `set due date to ${new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toDateString()}` },
      { cardId: dndCard.id,   actor: carol.name, action: 'added this card' },
      { cardId: dndCard.id,   actor: carol.name, action: `added the "Design" label` },
      { cardId: modalCard.id, actor: alice.name, action: 'added this card' },
    ],
  });

  console.log('✅ Labels, members, checklists, comments and activity logs assigned');
  console.log('');
  console.log('👤 Default logged-in user: Alice Johnson (alice@example.com)');
  console.log('👥 Sample members: Bob Smith, Carol White, David Lee, Eva Martinez');
  console.log('🗂  Boards created: Trello Clone Project, Marketing Campaign, Personal Tasks');
  console.log('');
  console.log('✅ Database seeded successfully!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
