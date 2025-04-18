# Diora Product Requirements Document

## 1. Product Overview

Diora is a diamond and gold jewelry e-commerce web application built with a focus on elegance, trust, and professional user experience. It allows users to browse a collection of jewelry products, view detailed information, add items to a cart, and complete their purchase through a smooth checkout process. Admins can manage products using a user-friendly panel, and all order data is persisted via a connected MongoDB database.

## 2. Tech Stack

Frontend:
- React
- React Router
- React Toastify (for notifications)
- Axios
- CSS

Backend:
- Node.js
- Express.js
- MongoDB Atlas
- OAuth 2.0 (Google Authentication)

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

### 3.2 User Experience Workflows

#### 1. New User Registration
1. **Email Registration Path**
   - Form completion
   - Email verification
   - Profile completion
   - Welcome experience

2. **Google Registration Path**
   - OAuth consent
   - Profile import
   - Additional info collection
   - Welcome experience

#### 2. Returning User Login
1. **Session Management**
   - Persistent login option
   - Remember me functionality
   - Auto-logout settings
   - Multiple device handling

2. **Login Context Preservation**
   - Shopping cart preservation
   - Return to previous page
   - Maintain search/filter states
   - Preserve form data

#### 3. User Session Flows
1. **Active Session**
   - Session timeout warnings
   - Automatic renewal
   - Idle state handling
   - Background token refresh

2. **Session Recovery**
   - Graceful session expiration
   - Re-authentication flow
   - State preservation during re-auth
   - Error recovery

### 3.3 Notification System

#### Toast Notification Requirements
1. **Single Source of Truth**
   - Component-level notification handling
   - No duplicate notifications from context/components
   - Unique toastId for each notification type

2. **Authentication Notifications**
   - Success notifications:
     - Regular login success
     - Google authentication success
     - Registration success
     - Logout success
   - Error notifications:
     - Authentication failures
     - Token-related errors
     - Network errors
     - Invalid credentials

3. **Implementation Guidelines**
   - Use unique toastIds to prevent duplicates
   - Handle notifications at component level
   - Clear error messages for user understanding
   - Consistent notification styling
   - Proper notification timing and duration

4. **Google Authentication Specific**
   - Success notification only shown in callback component
   - Error notifications with specific identifiers:
     - google-auth-error
     - google-no-token
     - google-login-success
     - google-auth-fail
     - google-callback-error

### 3.4 Product Features
[Previous product features sections remain unchanged...]

## 4. Technical Requirements

### 4.1 Code Organization
- Clear separation of concerns between context and components
- Component-level handling of UI feedback
- Consistent error handling patterns
- Prevention of race conditions in async operations

### 4.2 State Management
- Proper auth state management
- Secure token handling
- User session persistence
- Clear state cleanup on logout

### 4.3 Error Handling
- Comprehensive error catching
- User-friendly error messages
- Proper error logging
- Prevention of cascading failures

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