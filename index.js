const express = require('express');
const app = express(); // Create an Express application
const path = require('path');
const mongoose = require('mongoose'); // ORM for MongoDB
const methodOverride = require('method-override'); // Middleware to support PUT and DELETE requests
const AppError = require('./AppError'); // Custom error class for handling application-specific errors
const morgan = require('morgan'); // Middleware for logging HTTP requests

const Product = require('./models/product'); // Mongoose model for 'Product'

// Connect to the MongoDB database named 'farmStand2' with specified options
mongoose.connect('mongodb://localhost:27017/farmStand2', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!"); // Log successful connection
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!"); // Log error if connection fails
        console.log(err);
    });

// Use morgan middleware for logging HTTP requests in the 'tiny' format
app.use(morgan('tiny'));

// Set the directory for the views and the view engine to use EJS templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded data from POST requests
app.use(express.urlencoded({ extended: true }));

// Middleware to override HTTP methods for forms that don't support PUT and DELETE
app.use(methodOverride('_method'));

const categories = ['fruit', 'vegetable', 'dairy']; // Predefined categories for products

// Define wrapAsync function to handle async errors in route handlers
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(err => {
            // Check for specific Mongoose CastError (invalid ObjectId format)
            if (err.name === 'CastError' && err.kind === 'ObjectId') {
                // Create and pass a custom 404 error if ObjectId format is invalid
                const error = new AppError('Product Not Found', 404);
                next(error); // Pass the custom error to the global error handler
            } else {
                next(err); // Pass other errors to the global error handler
            }
        });
    };
}

// Route to list all products or filter by category
app.get('/products', wrapAsync(async (req, res, next) => {
    const { category } = req.query;
    let products;
    if (category) {
        products = await Product.find({ category }); // Find products by category
    } else {
        products = await Product.find({}); // Find all products if no category is specified
    }
    res.render('products/index', { products, category: category || 'All' }); // Render the products list
}));

// Route to show the form to create a new product
app.get('/products/new', (req, res) => {
    res.render('products/new', { categories }); // Render the form with predefined categories
});

// Route to create a new product and save it to the database
app.post('/products', wrapAsync(async (req, res, next) => {
    const newProduct = new Product(req.body); // Create a new product from the request body
    await newProduct.save(); // Save the new product to the database
    res.redirect(`/products/${newProduct._id}`); // Redirect to the newly created product's page
}));

// Route to show details of a specific product by ID
app.get('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id); // Find product by ID

    if (!product) {
        // Throw a custom 404 error if the product is not found
        const error = new AppError('Product Not Found', 404);
        throw error; // The global error handler will catch this
    }

    res.render('products/show', { product }); // Render the product details page
}));

// Route to show the form to edit a specific product by ID
app.get('/products/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id); // Find product by ID
    if (!product) {
        // Throw a custom 404 error if the product is not found
        const error = new AppError('Product Not Found', 404);
        return next(error); // Pass the error to the global error handler
    }
    res.render('products/edit', { product, categories }); // Render the edit form with current product details
}));

// Route to update a specific product by ID
app.put('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    // Update the product with new data from the request body, with validation and return the updated product
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`); // Redirect to the updated product's page
}));

// Route to delete a specific product by ID
app.delete('/products/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id); // Delete the product by ID
    res.redirect('/products'); // Redirect to the list of products
}));

// Function to handle validation errors
const handleValidationErr = err => {
    console.dir(err); // Log the error details
    return new AppError(`Validation Failed...${err.message}`, 400); // Return a custom 400 error
};

// Middleware to catch and handle validation errors
app.use((err, req, res, next) => {
    console.log(err.name); // Log the error name
    if (err.name === 'ValidationError') err = handleValidationErr(err); // Handle validation errors specifically
    next(err); // Pass the error to the next error handling middleware
});

// Global error handling middleware
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message); // Send the error response with status code and message
});

// Start the server on port 3000 and log that the server is running
app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!");
});