import express from 'express';
import User from '../models/User.js';
import { generateToken, protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role, brandName, ecoCertificate } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user data
        const userData = {
            name,
            email,
            password,
            role: role || 'buyer'
        };

        // If seller, add seller-specific fields
        if (role === 'seller') {
            userData.brandName = brandName;
            userData.ecoCertificate = ecoCertificate;
            userData.sellerStatus = 'pending';
        }

        const user = await User.create(userData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                sellerStatus: user.sellerStatus,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for admin
        if (email === 'admin@gmail.com' && password === 'admin@gmail.com') {
            // Find or create admin user
            let adminUser = await User.findOne({ email: 'admin@gmail.com' });

            if (!adminUser) {
                adminUser = await User.create({
                    name: 'Admin',
                    email: 'admin@gmail.com',
                    password: 'admin@gmail.com',
                    role: 'admin'
                });
            }

            return res.json({
                _id: adminUser._id,
                name: adminUser.name,
                email: adminUser.email,
                role: 'admin',
                token: generateToken(adminUser._id)
            });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if seller is verified
        if (user.role === 'seller') {
            if (user.sellerStatus === 'pending') {
                return res.status(403).json({
                    message: 'Your seller account is pending verification',
                    sellerStatus: 'pending'
                });
            }
            if (user.sellerStatus === 'rejected') {
                return res.status(403).json({
                    message: `Your seller application was rejected: ${user.rejectionReason}`,
                    sellerStatus: 'rejected',
                    rejectionReason: user.rejectionReason
                });
            }
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            sellerStatus: user.sellerStatus,
            brandName: user.brandName,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            brandName: user.brandName,
            sellerStatus: user.sellerStatus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
