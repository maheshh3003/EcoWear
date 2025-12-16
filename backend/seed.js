import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Blog from './models/Blog.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await User.deleteMany({});
        await Blog.deleteMany({});
        console.log('Data cleared');

        // Create admin
        await User.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin@gmail.com',
            role: 'admin'
        });
        console.log('Admin created');

        // Create sample blogs
        const blogs = [
            {
                title: 'The Complete Guide to Sustainable Fashion Materials',
                description: 'Discover the most eco-friendly fabrics and materials that are revolutionizing the fashion industry.',
                image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
                category: 'Materials',
                author: 'EcoWear Team',
                link: 'https://www.commonobjective.co/learn/sustainable-textile-guide',
                readTime: '8 min read',
                featured: true
            },
            {
                title: 'Organic Cotton vs Regular Cotton: Why It Matters',
                description: 'Learn about the environmental impact of organic cotton farming.',
                image: 'https://images.unsplash.com/photo-1445633629932-0029acc44e88?w=800',
                category: 'Materials',
                author: 'Green Fashion',
                link: 'https://www.sustainably-chic.com/blog/organic-cotton-guide',
                readTime: '6 min read',
                featured: false
            },
            {
                title: 'Bamboo Fabric: The Future of Sustainable Clothing',
                description: 'Explore how bamboo is transforming fashion with its naturally renewable properties.',
                image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
                category: 'Innovation',
                author: 'Eco Textile News',
                link: 'https://www.treehugger.com/bamboo-fabric-guide-4863878',
                readTime: '7 min read',
                featured: true
            },
            {
                title: 'Recycled Polyester: Turning Plastic into Fashion',
                description: 'Discover how recycled polyester is giving plastic bottles a second life.',
                image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800',
                category: 'Recycling',
                author: 'Zero Waste Fashion',
                link: 'https://www.patagonia.com/stories/recycled-polyester/story-18467.html',
                readTime: '5 min read',
                featured: false
            },
            {
                title: 'Hemp Clothing: Ancient Fabric, Modern Solution',
                description: 'Uncover the benefits of hemp as one of the most sustainable textiles.',
                image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800',
                category: 'Materials',
                author: 'Natural Fiber Alliance',
                link: 'https://goodonyou.eco/hemp-clothing-sustainable/',
                readTime: '6 min read',
                featured: false
            },
            {
                title: 'Understanding Fashion Carbon Footprint',
                description: 'Learn how to calculate and reduce the carbon footprint of your wardrobe.',
                image: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800',
                category: 'Environment',
                author: 'Carbon Trust',
                link: 'https://www.worldwildlife.org/stories/the-impact-of-a-cotton-t-shirt',
                readTime: '10 min read',
                featured: true
            },
            {
                title: 'Eco-Certifications Every Conscious Shopper Should Know',
                description: 'A guide to understanding GOTS, Fair Trade, OEKO-TEX certifications.',
                image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800',
                category: 'Education',
                author: 'Certified Sustainable',
                link: 'https://www.ethicalconsumer.org/fashion-clothing/shopping-guide/ethical-clothing-labels',
                readTime: '9 min read',
                featured: false
            },
            {
                title: 'Circular Fashion: Designing for a Zero-Waste Future',
                description: 'Explore the circular economy model in fashion.',
                image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
                category: 'Innovation',
                author: 'Ellen MacArthur Foundation',
                link: 'https://ellenmacarthurfoundation.org/topics/fashion/overview',
                readTime: '8 min read',
                featured: false
            },
            {
                title: 'How to Build a Sustainable Wardrobe',
                description: 'Practical tips for transitioning to a more sustainable wardrobe.',
                image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
                category: 'Lifestyle',
                author: 'The Good Trade',
                link: 'https://www.thegoodtrade.com/features/sustainable-fashion-guide/',
                readTime: '7 min read',
                featured: false
            }
        ];

        await Blog.insertMany(blogs);
        console.log('Blogs seeded');

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
