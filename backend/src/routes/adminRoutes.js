const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getAllUsers,
    toggleAdminStatus,
    deleteUser
} = require('../controllers/adminController');

// All routes require authentication and admin privileges
router.get('/users', protect, getAllUsers);
router.put('/users/:userId/admin', protect, toggleAdminStatus);
router.delete('/users/:userId', protect, deleteUser);

module.exports = router;
