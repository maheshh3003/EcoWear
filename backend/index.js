const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()

// loading env variable
dotenv.config()

// middleware
app.use(cors())
app.use(express.json())

// mongodb connection
mongoose.connect(process.env.DB_URL + process.env.DB_NAME).then(() => {
    console.log("MongoDB connection established")
})

// creating user schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    accountType: String, // 'buyer' or 'seller'
    // seller specific fields
    brandName: String,
    businessRegistration: String,
    phone: String,
    address: String,
    ecoCertificate: String,
    status: { type: String, default: 'active' } // for sellers: 'pending', 'verified', 'rejected'
})

const User = mongoose.model("users", userSchema)

// creating cart schema
const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    items: [{
        productId: String,
        name: String,
        brand: String,
        price: Number,
        image: String,
        size: String,
        quantity: Number,
        material: String,
        carbonFootprint: Number,
        sellerId: String
    }]
})

const Cart = mongoose.model("carts", cartSchema)

// creating order schema
const orderSchema = new mongoose.Schema({
    orderId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    buyerName: String,
    buyerEmail: String,
    items: [{
        productId: String,
        name: String,
        brand: String,
        price: Number,
        image: String,
        size: String,
        quantity: Number,
        material: String,
        carbonFootprint: Number,
        sellerId: String
    }],
    total: Number,
    carbonOffset: Number,
    status: { type: String, default: 'processing' },
    shippingAddress: {
        name: String,
        address: String,
        city: String,
        pincode: String,
        phone: String
    },
    paymentMethod: String,
    createdAt: { type: Date, default: Date.now }
})

const Order = mongoose.model("orders", orderSchema)

// creating product schema
const productSchema = new mongoose.Schema({
    uid: { type: String, unique: true },
    name: String,
    brand: String,
    price: Number,
    material: String,
    gender: String,
    age: String,
    carbonFootprint: Number,
    description: String,
    certificate: String,
    images: [String],
    sellerId: String,
    sellerBrand: String,
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
})

const Product = mongoose.model("products", productSchema)

// signup route
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password, accountType, brandName, businessRegistration, phone, address, ecoCertificate } = req.body

        // check if user already exists
        let existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // create user
        let user = {
            name,
            email,
            password: hashedPassword,
            accountType,
            status: accountType === 'seller' ? 'pending' : 'active'
        }

        // add seller fields if seller
        if (accountType === 'seller') {
            user.brandName = brandName
            user.businessRegistration = businessRegistration
            user.phone = phone
            user.address = address
            user.ecoCertificate = ecoCertificate
        }

        await User.create(user)

        res.json({ message: "Signup successful" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// login route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        // find user
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }

        // check password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" })
        }

        // check seller status (admins always allowed)
        if (user.accountType === 'seller' && user.status !== 'verified') {
            if (user.status === 'pending') {
                return res.status(400).json({ message: "Your seller account is pending verification" })
            }
            if (user.status === 'rejected') {
                return res.status(400).json({ message: "Your seller account was rejected" })
            }
        }

        // create jwt token (5 minutes expiry)
        const token = jwt.sign(
            { id: user._id, email: user.email, accountType: user.accountType },
            process.env.JWT_SECRET,
            { expiresIn: '5m' }
        )

        // send user data (without password)
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                accountType: user.accountType,
                brandName: user.brandName,
                status: user.status
            }
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// get user profile (protected route)
app.get("/profile", async (req, res) => {
    try {
        // get token from header
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: "No token provided" })
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // find user
        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json({ user })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ message: "No token provided" })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" })
    }
}

// ==================== CART ROUTES ====================

// get cart
app.get("/cart", verifyToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id })
        if (!cart) {
            cart = { items: [] }
        }
        res.json({ cart })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// add to cart
app.post("/cart/add", verifyToken, async (req, res) => {
    try {
        const { productId, name, brand, price, image, size, quantity, material, carbonFootprint, sellerId } = req.body

        let cart = await Cart.findOne({ userId: req.user.id })

        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] })
        }

        // check if item already exists
        const existingItem = cart.items.find(item => item.productId === productId && item.size === size)

        if (existingItem) {
            existingItem.quantity += quantity || 1
        } else {
            cart.items.push({ productId, name, brand, price, image, size, quantity: quantity || 1, material, carbonFootprint, sellerId })
        }

        await cart.save()
        res.json({ message: "Added to cart", cart })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// update cart item quantity
app.put("/cart/update", verifyToken, async (req, res) => {
    try {
        const { productId, size, quantity } = req.body

        let cart = await Cart.findOne({ userId: req.user.id })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" })
        }

        if (quantity < 1) {
            // remove item
            cart.items = cart.items.filter(item => !(item.productId === productId && item.size === size))
        } else {
            const item = cart.items.find(item => item.productId === productId && item.size === size)
            if (item) {
                item.quantity = quantity
            }
        }

        await cart.save()
        res.json({ message: "Cart updated", cart })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// remove from cart
app.delete("/cart/remove", verifyToken, async (req, res) => {
    try {
        const { productId, size } = req.body

        let cart = await Cart.findOne({ userId: req.user.id })

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" })
        }

        cart.items = cart.items.filter(item => !(item.productId === productId && item.size === size))

        await cart.save()
        res.json({ message: "Removed from cart", cart })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// clear cart
app.delete("/cart/clear", verifyToken, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ userId: req.user.id })
        res.json({ message: "Cart cleared" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// ==================== ORDER ROUTES ====================

// create order
app.post("/order", verifyToken, async (req, res) => {
    try {
        const { items, total, carbonOffset, shippingAddress, paymentMethod } = req.body

        // get user info
        const user = await User.findById(req.user.id)

        const order = new Order({
            orderId: `ECO${Date.now()}`,
            userId: req.user.id,
            buyerName: user.name,
            buyerEmail: user.email,
            items,
            total,
            carbonOffset,
            status: 'processing',
            shippingAddress,
            paymentMethod
        })

        await order.save()

        // clear cart after order
        await Cart.findOneAndDelete({ userId: req.user.id })

        res.json({ message: "Order placed successfully", order })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// get user orders (for buyers)
app.get("/orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 })
        res.json({ orders })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// get all orders (for admin only)
app.get("/orders/all", verifyToken, async (req, res) => {
    try {
        // Only admin@gmail.com can access all orders
        if (req.user.email !== 'admin@gmail.com') {
            return res.status(403).json({ message: "Access denied. Admin only." })
        }
        const orders = await Order.find().sort({ createdAt: -1 })
        res.json({ orders })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// get seller orders - seller@gmail.com gets all, others get only their products' orders
app.get("/orders/seller", verifyToken, async (req, res) => {
    try {
        // Special seller (seller@gmail.com) can see all orders
        if (req.user.email === 'seller@gmail.com') {
            const orders = await Order.find().sort({ createdAt: -1 })
            return res.json({ orders })
        }

        // Regular sellers only see orders containing their products
        const orders = await Order.find({ "items.sellerId": req.user.email }).sort({ createdAt: -1 })

        // filter items to only show seller's products
        const sellerOrders = orders.map(order => {
            const sellerItems = order.items.filter(item => item.sellerId === req.user.email)
            return {
                ...order.toObject(),
                items: sellerItems,
                sellerTotal: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            }
        })

        res.json({ orders: sellerOrders })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// update order status
app.put("/order/:orderId/status", verifyToken, async (req, res) => {
    try {
        const { status } = req.body
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status },
            { new: true }
        )
        res.json({ message: "Order status updated", order })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// ==================== ADMIN ROUTES ====================

// ==================== PRODUCT ROUTES ====================

// get all products
app.get("/products", async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 })
        res.json({ products })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// get products by seller
app.get("/products/seller", verifyToken, async (req, res) => {
    try {
        const products = await Product.find({ sellerId: req.user.email }).sort({ createdAt: -1 })
        res.json({ products })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// add product (seller only)
app.post("/products", verifyToken, async (req, res) => {
    try {
        const { name, brand, price, material, gender, age, carbonFootprint, description, certificate, images, sellerBrand } = req.body

        const product = new Product({
            uid: `PROD${Date.now()}`,
            name,
            brand,
            price,
            material,
            gender,
            age,
            carbonFootprint,
            description,
            certificate,
            images: images.filter(img => img && img.trim() !== ''),
            sellerId: req.user.email,
            sellerBrand: sellerBrand || brand,
            rating: 0,
            reviews: 0,
            status: 'active'
        })

        await product.save()
        res.json({ message: "Product added successfully", product })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// update product
app.put("/products/:uid", verifyToken, async (req, res) => {
    try {
        const { name, brand, price, material, gender, age, carbonFootprint, description, certificate, images, status } = req.body

        const product = await Product.findOneAndUpdate(
            { uid: req.params.uid, sellerId: req.user.email },
            { name, brand, price, material, gender, age, carbonFootprint, description, certificate, images: images.filter(img => img && img.trim() !== ''), status },
            { new: true }
        )

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.json({ message: "Product updated", product })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// delete product
app.delete("/products/:uid", verifyToken, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ uid: req.params.uid, sellerId: req.user.email })

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.json({ message: "Product deleted" })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// ==================== ADMIN SELLER ROUTES ====================

// get all pending sellers (for admin verification)
app.get("/admin/sellers/pending", async (req, res) => {
    try {
        const sellers = await User.find({ accountType: 'seller', status: 'pending' }).select('-password')
        res.json({ sellers })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// get all sellers (for admin)
app.get("/admin/sellers", async (req, res) => {
    try {
        const sellers = await User.find({ accountType: 'seller' }).select('-password')
        res.json({ sellers })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// verify seller
app.put("/admin/seller/:id/verify", async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'verified' },
            { new: true }
        ).select('-password')
        res.json({ message: "Seller verified", seller })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// reject seller
app.put("/admin/seller/:id/reject", async (req, res) => {
    try {
        const seller = await User.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).select('-password')
        res.json({ message: "Seller rejected", seller })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// get admin stats
app.get("/admin/stats", async (req, res) => {
    try {
        const totalSellers = await User.countDocuments({ accountType: 'seller' })
        const pendingSellers = await User.countDocuments({ accountType: 'seller', status: 'pending' })
        const verifiedSellers = await User.countDocuments({ accountType: 'seller', status: 'verified' })
        const rejectedSellers = await User.countDocuments({ accountType: 'seller', status: 'rejected' })
        const totalOrders = await Order.countDocuments()
        const totalBuyers = await User.countDocuments({ accountType: 'buyer' })

        // get orders per seller
        const sellerOrderStats = await Order.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.sellerId", orderCount: { $sum: 1 }, totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } }
        ])

        res.json({
            totalSellers,
            pendingSellers,
            verifiedSellers,
            rejectedSellers,
            totalOrders,
            totalBuyers,
            sellerOrderStats
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server error" })
    }
})

// test route
app.get("/test", (req, res) => {
    res.json({ message: "Server is working" })
})

// seed admin and seller accounts
app.get("/seed", async (req, res) => {
    try {
        // Check if admin exists
        let admin = await User.findOne({ email: 'admin@gmail.com' })
        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin@gmail.com', 10)
            admin = await User.create({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                accountType: 'admin',
                status: 'active'
            })
            console.log('Admin account created')
        }

        // Check if seller exists
        let seller = await User.findOne({ email: 'seller@gmail.com' })
        if (!seller) {
            const hashedPassword = await bcrypt.hash('seller@gmail.com', 10)
            seller = await User.create({
                name: 'Demo Seller',
                email: 'seller@gmail.com',
                password: hashedPassword,
                accountType: 'seller',
                brandName: 'EcoWear Demo',
                businessRegistration: 'BRN123456',
                phone: '9876543210',
                address: 'Mumbai, India',
                ecoCertificate: '',
                status: 'verified'
            })
            console.log('Seller account created')
        }

        res.json({ message: 'Seed completed', admin: admin.email, seller: seller.email })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Seed failed', error: err.message })
    }
})

app.listen(process.env.PORT, () => {
    console.log("Server up and running on port " + process.env.PORT)
})
