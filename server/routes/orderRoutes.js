    const express = require('express');
    const Order = require('../models/Order');
    const router = express.Router();

    // GET all orders
    router.get('/', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    });

    // POST a new order
    router.post('/', async (req, res) => {
    const { items, total } = req.body;
    const newOrder = new Order({ items, total });

    try {
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    });

    // DELETE all orders
    router.delete('/', async (req, res) => {
    try {
      await Order.deleteMany({});
      res.json({ message: 'Order history cleared successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
    });
  

    module.exports = router;
