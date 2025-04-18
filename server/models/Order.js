const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
