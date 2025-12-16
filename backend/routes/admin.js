import express from 'express';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/sellers
// @desc    Get all sellers
// @access  Private/Admin
router.get('/sellers', protect, admin, async (req, res) => {
    try {
        const sellers = await User.find({ role: 'seller' }).select('-password');
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/verification-requests
// @desc    Get pending seller verification requests
// @access  Private/Admin
router.get('/verification-requests', protect, admin, async (req, res) => {
    try {
        const pendingSellers = await User.find({
            role: 'seller',
            sellerStatus: 'pending'
        }).select('-password');
        res.json(pendingSellers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/verify-seller/:id
// @desc    Verify a seller
// @access  Private/Admin
router.put('/verify-seller/:id', protect, admin, async (req, res) => {
    try {
        const seller = await User.findById(req.params.id);

        if (!seller || seller.role !== 'seller') {
            return res.status(404).json({ message: 'Seller not found' });
        }

        seller.sellerStatus = 'verified';
        seller.verifiedBy = req.user._id;
        seller.verifiedAt = Date.now();
        await seller.save();

        res.json({ message: 'Seller verified successfully', seller });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/admin/reject-seller/:id
// @desc    Reject a seller
// @access  Private/Admin
router.put('/reject-seller/:id', protect, admin, async (req, res) => {
    try {
        const { reason } = req.body;
        const seller = await User.findById(req.params.id);

        if (!seller || seller.role !== 'seller') {
            return res.status(404).json({ message: 'Seller not found' });
        }

        seller.sellerStatus = 'rejected';
        seller.rejectionReason = reason;
        await seller.save();

        res.json({ message: 'Seller rejected', seller });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalSellers = await User.countDocuments({ role: 'seller' });
        const verifiedSellers = await User.countDocuments({ role: 'seller', sellerStatus: 'verified' });
        const pendingRequests = await User.countDocuments({ role: 'seller', sellerStatus: 'pending' });
        const totalBuyers = await User.countDocuments({ role: 'buyer' });

        res.json({
            totalSellers,
            verifiedSellers,
            pendingRequests,
            totalBuyers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
