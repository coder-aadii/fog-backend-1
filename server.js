const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());  // To parse JSON request bodies

// MongoDB URI
const mongoURI = 'mongodb+srv://adityaaerpule191996:Asdf1234@fog-cluster.x015l.mongodb.net/fog_database?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Failed to connect to MongoDB Atlas:', err));

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String
});

// Create Product model
const Product = mongoose.model('Product', productSchema);

// API to get products with pagination
app.get('/api/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;

    // Get total product count and paginated products
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    // Check if the requested page is valid, if not return the first page
    if (page > totalPages) {
      return res.status(400).json({ message: 'Page number exceeds total pages.' });
    }

    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      products,
      total: totalProducts,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Serve static files
app.use(express.static('public')); // Make sure static files like index.html are served AFTER the API routes

// Start the server on the given PORT or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
