const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.get('/:userId', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/:userId/read-all', notificationController.markAllAsRead);

module.exports = router;
