import React, { useContext, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { cartItems } = useContext(CartContext);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Calculate the total number of items in the cart
  const itemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  // Close the user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load the Playfair Display font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <nav className="navbar">
      {/* Brand Logo and Tagline */}
      <Link to="/" className="brand-container">
        <h2 className="brand-name">Diora</h2>
        <p className="brand-tagline">Luxury You Deserve</p>
      </Link>

      {/* Navigation Links */}
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/catalog" className="nav-link">Catalog</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/contact" className="nav-link">Contact</Link>
        <Link to="/cart" className="nav-link cart-link">
          Cart 
          {itemCount > 0 && (
            <span className="cart-badge">
              {itemCount}
            </span>
          )}
        </Link>
        
        <div className="auth-section">
          {user ? (
            <div className="user-menu-container" ref={menuRef}>
              <button 
                className="user-avatar-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="User menu"
              >
                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </button>
              
              {showUserMenu && (
                <div className="user-menu">
                  <div className="user-menu-header">
                    <p className="user-name">{user.firstName} {user.lastName}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <Link to="/profile" className="menu-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-user"></i>
                    Profile
                  </Link>
                  <Link to="/order-history" className="menu-item" onClick={() => setShowUserMenu(false)}>
                    <i className="fas fa-history"></i>
                    Orders
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="menu-item" onClick={() => setShowUserMenu(false)}>
                      <i className="fas fa-cog"></i>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} className="menu-item logout-button">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="nav-link login-link">Login</Link>
              <Link to="/register" className="nav-link register-link">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
