const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const AppError = require('./AppError');
const morgan = require('morgan');

const Product = require('./models/product');

mongoose.connect('mongodb://localhost:27017/farmStand2', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

app.use(morgan('tiny'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

const categories = ['fruit', 'vegetable', 'dairy'];


app.get('/products', async (req, res, next) => {
    const { category } = req.query;
    if (category) {
        const products = await Product.find({ category })
        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })
    }
})

app.get('/products/new', (req, res) => {
    res.render('products/new', { categories })
})

app.post('/products', async (req, res, next) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`)
})


app.get('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id)
        if (!product) {
            const error = new AppError('Product Not Found', 404);
            return next(error); // Pass the error to the error handling middleware
        }
        res.render('products/show', { product })
    } catch (err) {
         if (err.name === 'CastError') {
            // Handle specific CastError when invalid ID format is provided
            const error = new AppError('Product Not Found', 404);
            return next(error);
        }
        // For other errors, pass to the global error handler
        return next(err);
    }
})

app.get('/products/:id/edit', async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            const error = new AppError('Product Not Found', 404);
            return next(error); // Pass the error to the error handling middleware
        }
        res.render('products/edit', { product, categories })
    } catch (err) {
         if (err.name === 'CastError') {
            // Handle specific CastError when invalid ID format is provided
            const error = new AppError('Product Not Found', 404);
            return next(error);
        }
        // For other errors, pass to the global error handler
        return next(err);
    }
})

app.put('/products/:id', async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect(`/products/${product._id}`);
})

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
});

// const handleValidationErr = err => {
//     console.dir(err);
//     //In a real app, we would do a lot more here...
//     return new AppError(`Validation Failed...${err.message}`, 400)
// }

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something went wrong' } = err;
    res.status(status).send(message);
})

app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})


