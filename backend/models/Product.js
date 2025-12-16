import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['bamboo', 'organic', 'recycled', 'hemp'],
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex', 'kids'],
        default: 'unisex'
    },
    ageGroup: {
        type: String,
        enum: ['adult', 'kids'],
        default: 'adult'
    },
    images: [{
        type: String
    }],
    carbonFootprint: {
        type: Number,
        required: true,
        min: 0
    },
    certificate: {
        type: String,
        default: ''
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
