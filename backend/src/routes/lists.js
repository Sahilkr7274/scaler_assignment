const router = require('express').Router();
const prisma = require('../prisma');

// POST create list
router.post('/', async (req, res) => {
  try {
    const { title, boardId } = req.body;
    const last = await prisma.list.findFirst({ where: { boardId }, orderBy: { position: 'desc' } });
    const position = last ? last.position + 1 : 1;
    const list = await prisma.list.create({ data: { title, boardId, position } });
    res.status(201).json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH reorder lists — must be BEFORE /:id so Express doesn't match 'reorder' as an id
router.patch('/reorder/batch', async (req, res) => {
  try {
    const { lists } = req.body;
    await Promise.all(
      lists.map(({ id, position }) =>
        prisma.list.update({ where: { id }, data: { position } })
      )
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATCH update list title
router.patch('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const list = await prisma.list.update({ where: { id: req.params.id }, data: { title } });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE list
router.delete('/:id', async (req, res) => {
  try {
    await prisma.list.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
