const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String }
});

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleId: {
    type: String,
    sparse: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  cart: {
    items: [cartItemSchema],
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date 
  }
});

// Hash password before saving (only for local auth)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.authProvider === 'google') return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.authProvider === 'google') return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to merge cart items
userSchema.methods.mergeCartItems = function(localCartItems) {
  if (!Array.isArray(localCartItems)) {
    throw new Error('Invalid cart items format');
  }

  const mergedItems = [...this.cart.items];
  
  localCartItems.forEach(localItem => {
    if (!localItem.productId || !localItem.name || typeof localItem.price === 'undefined') {
      throw new Error('Invalid cart item format');
    }

    const existingItemIndex = mergedItems.findIndex(
      item => item.productId.toString() === localItem.productId.toString()
    );
    
    if (existingItemIndex >= 0) {
      // If item exists, update quantity
      mergedItems[existingItemIndex].quantity += localItem.quantity || 1;
    } else {
      // If item doesn't exist, add it
      mergedItems.push({
        productId: localItem.productId,
        name: localItem.name,
        price: typeof localItem.price === 'number' ? localItem.price : parseFloat(localItem.price),
        quantity: localItem.quantity || 1,
        image: localItem.image
      });
    }
  });
  
  this.cart.items = mergedItems;
  this.cart.updatedAt = Date.now();
  return this.cart;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 