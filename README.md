# Simple Express MongoDB Application with File Handling

This is a sample Express.js application that demonstrates basic CRUD operations with MongoDB with file handling no User Interface Added just for my study purposes and reference

## Getting Started

To get started with this project, follow the steps below:

### Prerequisites

- Node.js (v14 or higher recommended)
- MongoDB (running locally on `localhost:27017`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/your-repo-name.git
   cd your-repo-name

2. Install the dependencies
   ```bash
   npm install
	
### Running the Development Server
1. Start the MongoDB server if it's not running:
   ```bash
   mongod
2. Start the Express server:
   ```bash
   npm run dev
   ```
   Alternatively, you can use yarn or pnpm:
   ```bash
   yarn dev
   ```
   ```bash
   pnpm dev
   ```
3. Open your browser and navigate to http://localhost:3000 to see the application.

### Project Structure

- index.js: The main entry point of the application where routes and middleware are defined.
- models/product.js: The Mongoose schema and model for the product.
- views: Directory containing EJS templates for rendering the pages.
- AppError.js: Custom error class for handling application-specific errors.

### Packages Used
The following npm packages are used in this project:

- express: Fast, unopinionated, minimalist web framework for Node.js.
- ejs: Embedded JavaScript templating.
- mongoose: Elegant MongoDB object modeling for Node.js.
- method-override: Middleware for overriding HTTP methods in forms.
- morgan: HTTP request logger middleware for Node.js.

### Features
- List Products: View a list of all products, optionally filtered by category.
- Add New Product: Create a new product and save it to the MongoDB database.
- View Product Details: View details of a specific product by ID.
- Edit Product: Update an existing product.
- Delete Product: Remove a product from the database.

   
