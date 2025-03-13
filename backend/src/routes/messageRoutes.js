const express = require('express');
const { getMessagesByTicketId, createMessage } = require('../controllers/messageController');

const router = express.Router();

router.get('/ticket/:ticketId', getMessagesByTicketId);
router.post('/ticket/:ticketId', createMessage);

module.exports = router;