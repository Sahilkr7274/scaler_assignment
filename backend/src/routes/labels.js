const router = require('express').Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  try {
    const labels = await prisma.label.findMany();
    res.json(labels);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await prisma.label.create({ data: { name, color } });
    res.status(201).json(label);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
