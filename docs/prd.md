# Diora Product Requirements Document

## 1. Product Overview

Diora is a diamond and gold jewelry e-commerce web application built with a focus on elegance, trust, and professional user experience. It allows users to browse a collection of jewelry products, view detailed information, add items to a cart, and complete their purchase through a smooth checkout process. Admins can manage products using a user-friendly panel, and all order data is persisted via a connected MongoDB database.

## 2. Tech Stack

### Frontend
- React
- React Router
- React Toastify (for notifications)
- Axios (API client)
- CSS

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- OAuth 2.0 (Google Authentication)

### Development & Deployment
- Version Control: Git
- Deployment-ready for platforms like Vercel or Render
- Local development setup included

## 3. Core Features and Functionality

### 3.1 User Authentication & Management

#### Authentication Methods
1. **Email/Password Authentication**
   - Registration Flow:
     1. User fills out registration form (email, password, confirm password)
     2. Client-side validation of inputs
     3. Server validates email uniqueness
     4. Password hashing on server
     5. User record creation in MongoDB
     6. Automatic login after successful registration
     7. Redirect to intended destination or homepage

   - Login Flow:
     1. User enters email and password
     2. Client-side validation
     3. Server authentication
     4. JWT token generation and storage
     5. User state update in AuthContext
     6. Redirect to intended destination

2. **Google OAuth Authentication**
   - Login Initiation:
     1. User clicks "Sign in with Google"
     2. Current path stored in localStorage (postLoginRedirect)
     3. Redirect to Google OAuth consent screen
     4. State parameter included for security

   - OAuth Callback Handling:
     1. Google redirects to /auth/google/callback
     2. Token extraction from URL
     3. Server validation of Google token
     4. User profile retrieval/creation
     5. JWT token generation
     6. Redirect to original path

#### Session Management
1. **Token Handling**
   - JWT stored in localStorage
   - Token included in Authorization header
   - Automatic token refresh mechanism
   - Secure token cleanup on logout

2. **State Persistence**
   - User state maintained in AuthContext
   - Automatic state recovery on page refresh
   - Session expiration handling
   - Cross-tab synchronization

#### User Profile Management
1. **Profile Data**
   - Basic info (name, email)
   - Authentication method tracking
   - Last login timestamp
   - Account creation date

2. **Profile Operations**
   - View profile details
   - Update profile information
   - Change password (email users)
   - Link/unlink social accounts

#### Security Measures
1. **Authentication Security**
   - Rate limiting on auth attempts
   - Password strength requirements
   - Secure password reset flow
   - Account lockout after failed attempts

2. **Session Security**
   - Token expiration
   - Secure token storage
   - CSRF protection
   - XSS prevention

#### Error Handling & Recovery
1. **Authentication Errors**
   - Invalid credentials
   - Account not found
   - Email already registered
   - Password mismatch
   - Network failures
   - OAuth failures

2. **Recovery Flows**
   - Password reset
   - Account recovery
   - Email verification
   - Support contact

### 3.2 Product Features

#### Catalog & Product Display
- Product list fetched dynamically from MongoDB
- Grid layout with image, title, price
- "Add to Cart" and "View Details" for each product
- Catalog reflects real-time product database updates
- Dynamic routing based on product ID
- Detailed product view with:
  - High-quality images
  - Detailed description
  - Adjustable quantity
  - Price information
  - Add to cart functionality
- Error handling for invalid products

#### Shopping Cart
- Cart stored in localStorage
- Displays product name, price, quantity
- Ability to remove individual items
- Real-time price calculation
- Link to checkout page
- Cart preservation across sessions

#### Checkout Process
- Modal confirmation popup before placing order
- Places order via API and stores in database
- Clears cart upon confirmation
- Toast notifications for success/failure
- Order association with user account

#### Order Management
- Comprehensive order history
- Displays each order: date, items, quantity, total
- Option to clear order history
- User-specific order tracking
- Order status updates

### 3.3 Admin Features

#### Product Management
- Add new products via form:
  - Name
  - Description
  - Price
  - Image URL
- View existing products
- Delete products
- Edit existing product information
- Pre-filled forms for updates
- Live feedback using alerts

#### Admin Reporting
- Overall sales reports
- User purchase analytics
- Complete order and user metadata
- Product performance metrics

### 3.4 Notification System

#### Toast Notification Requirements
1. **Single Source of Truth**
   - Component-level notification handling
   - No duplicate notifications
   - Unique toastId for each notification type

2. **Authentication Notifications**
   - Success notifications for:
     - Regular login
     - Google authentication
     - Registration
     - Logout
   - Error notifications for:
     - Authentication failures
     - Token-related errors
     - Network errors
     - Invalid credentials

3. **Implementation Guidelines**
   - Unique toastIds to prevent duplicates
   - Component-level notification handling
   - Clear error messages
   - Consistent notification styling
   - Proper timing and duration

## 4. Technical Requirements

### 4.1 Code Organization
```
diora/
├── client/                        # React frontend
│   ├── public/
│   │   └── ...
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
```

### 4.2 Development Guidelines
- Clear separation of concerns between context and components
- Component-level handling of UI feedback
- Consistent error handling patterns
- Prevention of race conditions in async operations

### 4.3 State Management
- Proper auth state management
- Secure token handling
- User session persistence
- Clear state cleanup on logout

## 5. Security Requirements

### 5.1 Authentication Security
- Secure token storage
- HTTPS for all API calls
- Protection against CSRF attacks
- Proper session management
- Secure handling of OAuth tokens

### 5.2 Data Security
- Encrypted user data
- Secure password handling
- Protection against XSS attacks
- Regular security audits

## 6. Testing Requirements
- Unit tests for authentication flows
- Integration tests for Google OAuth
- End-to-end testing of user journeys
- Error scenario testing
- Notification system testing 