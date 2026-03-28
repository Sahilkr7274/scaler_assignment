const router = require('express').Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  try {
    const members = await prisma.member.findMany();
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const member = await prisma.member.create({ data: { name, email, avatar } });
    res.status(201).json(member);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
