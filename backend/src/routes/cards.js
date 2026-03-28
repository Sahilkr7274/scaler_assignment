const router = require('express').Router();
const prisma = require('../prisma');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const ACTOR = 'Alice Johnson';

async function logActivity(cardId, action) {
  await prisma.activityLog.create({ data: { cardId, actor: ACTOR, action } });
}

const cardInclude = {
  labels: { include: { label: true } },
  members: { include: { member: true } },
  checklists: { include: { items: true } },
  comments: { orderBy: { createdAt: 'asc' } },
  activities: { orderBy: { createdAt: 'desc' }, take: 20 },
  attachments: { orderBy: { createdAt: 'desc' } },
};

// POST create card
router.post('/', async (req, res) => {
  try {
    const { title, listId } = req.body;
    const last = await prisma.card.findFirst({ where: { listId }, orderBy: { position: 'desc' } });
    const position = last ? last.position + 1 : 1;
    const card = await prisma.card.create({ data: { title, listId, position } });
    await logActivity(card.id, `added this card`);
    res.status(201).json(card);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET search (must be before /:id)
router.get('/search/query', async (req, res) => {
  try {
    const { q, labelId, memberId, dueDate } = req.query;
    const cards = await prisma.card.findMany({
      where: {
        archived: false,
        ...(q && { title: { contains: q, mode: 'insensitive' } }),
        ...(labelId && { labels: { some: { labelId } } }),
        ...(memberId && { members: { some: { memberId } } }),
        ...(dueDate && { dueDate: { lte: new Date(dueDate) } }),
      },
      include: {
        labels: { include: { label: true } },
        members: { include: { member: true } },
        list: { include: { board: true } },
      },
    });
    res.json(cards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH reorder/move cards (must be before /:id)
router.patch('/reorder/batch', async (req, res) => {
  try {
    const { cards } = req.body;
    await Promise.all(
      cards.map(({ id, position, listId }) =>
        prisma.card.update({ where: { id }, data: { position, listId } })
      )
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET single card
router.get('/:id', async (req, res) => {
  try {
    const card = await prisma.card.findUnique({ where: { id: req.params.id }, include: cardInclude });
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH update card
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, archived, cover } = req.body;
    const prev = await prisma.card.findUnique({ where: { id: req.params.id } });
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(archived !== undefined && { archived }),
        ...(cover !== undefined && { cover }),
      },
    });
    if (title !== undefined && prev.title !== title) await logActivity(card.id, `renamed this card to "${title}"`);
    if (dueDate !== undefined && String(prev.dueDate) !== String(dueDate)) await logActivity(card.id, dueDate ? `set due date to ${new Date(dueDate).toDateString()}` : `removed the due date`);
    if (archived !== undefined && prev.archived !== archived) await logActivity(card.id, archived ? `archived this card` : `unarchived this card`);
    if (cover !== undefined && prev.cover !== cover) await logActivity(card.id, cover ? `set card cover color` : `removed card cover`);
    res.json(card);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE card
router.delete('/:id', async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST add label
router.post('/:id/labels', async (req, res) => {
  try {
    const { labelId } = req.body;
    await prisma.cardLabel.create({ data: { cardId: req.params.id, labelId } });
    const label = await prisma.label.findUnique({ where: { id: labelId } });
    await logActivity(req.params.id, `added the "${label?.name}" label`);
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE remove label
router.delete('/:id/labels/:labelId', async (req, res) => {
  try {
    await prisma.cardLabel.delete({
      where: { cardId_labelId: { cardId: req.params.id, labelId: req.params.labelId } },
    });
    const label = await prisma.label.findUnique({ where: { id: req.params.labelId } });
    await logActivity(req.params.id, `removed the "${label?.name}" label`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST assign member
router.post('/:id/members', async (req, res) => {
  try {
    const { memberId } = req.body;
    await prisma.cardMember.create({ data: { cardId: req.params.id, memberId } });
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    await logActivity(req.params.id, `added ${member?.name} to this card`);
    res.status(201).json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE remove member
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    await prisma.cardMember.delete({
      where: { cardId_memberId: { cardId: req.params.id, memberId: req.params.memberId } },
    });
    const member = await prisma.member.findUnique({ where: { id: req.params.memberId } });
    await logActivity(req.params.id, `removed ${member?.name} from this card`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST add checklist
router.post('/:id/checklists', async (req, res) => {
  try {
    const { title } = req.body;
    const checklist = await prisma.checklist.create({
      data: { title, cardId: req.params.id },
      include: { items: true },
    });
    await logActivity(req.params.id, `added checklist "${title}"`);
    res.status(201).json(checklist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE checklist
router.delete('/:id/checklists/:checklistId', async (req, res) => {
  try {
    const cl = await prisma.checklist.findUnique({ where: { id: req.params.checklistId } });
    await prisma.checklist.delete({ where: { id: req.params.checklistId } });
    await logActivity(req.params.id, `deleted checklist "${cl?.title}"`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST add checklist item
router.post('/:id/checklists/:checklistId/items', async (req, res) => {
  try {
    const { text } = req.body;
    const item = await prisma.checklistItem.create({ data: { text, checklistId: req.params.checklistId } });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH toggle checklist item
router.patch('/:id/checklists/:checklistId/items/:itemId', async (req, res) => {
  try {
    const { completed, text } = req.body;
    const item = await prisma.checklistItem.update({
      where: { id: req.params.itemId },
      data: { ...(completed !== undefined && { completed }), ...(text !== undefined && { text }) },
    });
    if (completed !== undefined) {
      await logActivity(req.params.id, completed ? `completed "${item.text}"` : `marked "${item.text}" incomplete`);
    }
    res.json(item);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE checklist item
router.delete('/:id/checklists/:checklistId/items/:itemId', async (req, res) => {
  try {
    await prisma.checklistItem.delete({ where: { id: req.params.itemId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST add comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { text, author } = req.body;
    const comment = await prisma.comment.create({ data: { text, author, cardId: req.params.id } });
    await logActivity(req.params.id, `commented: "${text.substring(0, 60)}${text.length > 60 ? '…' : ''}"`);
    res.status(201).json(comment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.commentId } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST upload attachment
router.post('/:id/attachments', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    const attachment = await prisma.attachment.create({
      data: { cardId: req.params.id, name: req.file.originalname, url },
    });
    await logActivity(req.params.id, `attached "${req.file.originalname}"`);
    res.status(201).json(attachment);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE attachment
router.delete('/:id/attachments/:attachmentId', async (req, res) => {
  try {
    const att = await prisma.attachment.findUnique({ where: { id: req.params.attachmentId } });
    await prisma.attachment.delete({ where: { id: req.params.attachmentId } });
    await logActivity(req.params.id, `removed attachment "${att?.name}"`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
