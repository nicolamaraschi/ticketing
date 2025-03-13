const express = require('express');
const { getAllUsers, getSupportUsers, getUserById } = require('../controllers/userController');
const { isAdmin, isSupport } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', isSupport, getAllUsers);
router.get('/support', getSupportUsers);
router.get('/:id', getUserById);

module.exports = router;