const router = require('express').Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  try {
    const boards = await prisma.board.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(boards);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                labels: { include: { label: true } },
                members: { include: { member: true } },
                checklists: { include: { items: true } },
                _count: { select: { comments: true, attachments: true } },
              },
            },
          },
        },
      },
    });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    res.json(board);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, background } = req.body;
    const board = await prisma.board.create({ data: { title, background } });
    res.status(201).json(board);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { title, background } = req.body;
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(background !== undefined && { background }),
      },
    });
    res.json(board);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.board.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
