const express = require('express');
const { auth } = require('../middleware/auth');
const { getEvents, createEvent } = require('../controllers/calendarController');

const router = express.Router();

router.get('/events', auth, getEvents);
router.post('/events', auth, createEvent);


module.exports = router;