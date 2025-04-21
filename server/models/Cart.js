const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String }
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Update the updatedAt timestamp before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to merge items from another cart (e.g., guest cart)
cartSchema.methods.mergeWithCart = function(itemsToMerge) {
  const updatedItems = [...this.items];
  
  itemsToMerge.forEach(newItem => {
    const existingItemIndex = updatedItems.findIndex(
      item => item.productId.toString() === newItem.productId.toString()
    );
    
    if (existingItemIndex >= 0) {
      // If item exists, sum the quantities
      updatedItems[existingItemIndex].quantity += newItem.quantity;
    } else {
      // If item doesn't exist, add it
      updatedItems.push(newItem);
    }
  });
  
  this.items = updatedItems;
  return this;
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 