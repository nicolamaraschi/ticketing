const express = require('express');
const { getAllTickets, getTicketById, createTicket, updateTicketStatus, assignTicket } = require('../controllers/ticketController');
const { isSupport } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getAllTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.patch('/:id/status', isSupport, updateTicketStatus);
router.patch('/:id/assign', isSupport, assignTicket);

module.exports = router;