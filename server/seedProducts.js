const mongoose = require('mongoose');
require('dotenv').config();

// Define the Product model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

const Product = mongoose.model('Product', productSchema);

// Sample products data
const sampleProducts = [
  {
    name: 'Diamond Engagement Ring',
    description: 'A beautiful 1-carat diamond engagement ring set in 18k gold.',
    price: 2999.99,
    image: '/assets/catalog/ring 1.png'
  },
  {
    name: 'Gold Necklace',
    description: 'An elegant 18k gold necklace with a delicate pendant.',
    price: 899.99,
    image: '/assets/catalog/gold necklace.png'
  },
  {
    name: 'Platinum Bracelet',
    description: 'A sophisticated platinum bracelet with intricate detailing.',
    price: 1499.99,
    image: '/assets/catalog/bracelet.png'
  },
  {
    name: 'Sapphire Earrings',
    description: 'Stunning sapphire earrings set in white gold.',
    price: 799.99,
    image: '/assets/catalog/earrings.png'
  },
  {
    name: 'Pearl Necklace',
    description: 'A classic pearl necklace that adds elegance to any outfit.',
    price: 599.99,
    image: '/assets/catalog/pearl necklace.png'
  }
];

// Connect to MongoDB and seed the database
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    try {
      // Clear existing products
      await Product.deleteMany({});
      console.log('Cleared existing products');
      
      // Insert sample products
      const insertedProducts = await Product.insertMany(sampleProducts);
      console.log(`Successfully added ${insertedProducts.length} products to the database`);
      
      // Disconnect from MongoDB
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error seeding the database:', error);
    }
  })
  .catch((err) => console.error('Error connecting to MongoDB:', err)); 