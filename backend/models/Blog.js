import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide blog title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide blog description']
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Materials', 'Innovation', 'Recycling', 'Environment', 'Education', 'Awareness', 'Lifestyle'],
        required: true
    },
    author: {
        type: String,
        default: 'EcoWear Team'
    },
    link: {
        type: String,
        required: true
    },
    readTime: {
        type: String,
        default: '5 min read'
    },
    featured: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
