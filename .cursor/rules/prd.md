1. Product Overview

Diora is a diamond and gold jewelry e-commerce web application built with a focus on elegance, trust, and professional user experience. It allows users to browse a collection of jewelry products, view detailed information, add items to a cart, and complete their purchase through a smooth checkout process. Admins can manage products using a user-friendly panel, and all order data is persisted via a connected MongoDB database.

2. Tech Stack

Frontend: React, React Router, React Toastify, Axios, CSS

Backend: Node.js, Express.js

Database: MongoDB Atlas

API Client: Axios

Version Control: Git

Deployment-ready (local dev setup with possibility to deploy to platforms like Vercel or Render)

3. Core Features and Functionality

3.1 Catalog & Product Display

Product list fetched dynamically from MongoDB

Grid layout with image, title, price

"Add to Cart" and "View Details" for each product

Catalog reflects real-time product database updates

3.2 Product Details Page

Dynamic routing based on product ID

Detailed view: image, description, adjustable quantity, price

Adds product to cart with quantity

Error handling for invalid products

3.3 Shopping Cart

Cart stored in localStorage

Displays product name, price, quantity

Ability to remove individual items

Real-time price calculation

Link to checkout page

3.4 Checkout

Modal confirmation popup before placing order

Places order via API and stores in database

Clears cart upon confirmation

Toast notifications for success/failure

3.5 Order History

Fetches all orders from MongoDB

Displays each order: date, items, quantity, total

Includes a button to clear all order history (database-level delete)

3.6 Admin Panel

Add new products via a form (name, description, price, image URL)

View existing products

Delete a product from the list

Edit existing product info (pre-fill form for update)

Live feedback using alerts

3.7 User Authentication and Purchase Experience

User Accounts: Ability to register and login to the website

Google Authentication: OAuth 2.0 integration for seamless sign-in with Google accounts

Personalized Shopping: Logged-in users have a unique experience for browsing, purchasing, and checking out

Order Association: Each order is linked to a specific user, allowing users to view their personal order history

User Dashboard: Users can access their previous purchases and status

Admin Reporting: Admin panel enhanced to show overall sales report, linking users to purchased items and showing complete order and user metadata

4. Folder Structure
diora/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/            # Navbar, Footer
│   │   ├── context/               # CartContext.js
│   │   ├── pages/                 # Home.js, Catalog.js, Product.js, etc.
│   │   ├── utils/                 # Axios instance config (api.js)
│   │   ├── App.js                 # Main App component
│   │   ├── index.js               # Entry point
│   └── package.json              # React project config
│
├── server/                        # Node + Express backend
│   ├── models/                    # Mongoose models: Product.js, Order.js
│   ├── routes/                    # Express routes: productRoutes.js, orderRoutes.js
│   ├── .env                       # MongoDB connection string
│   ├── server.js                 # Express entry point
│   └── package.json              # Backend project config
│
├── .gitignore