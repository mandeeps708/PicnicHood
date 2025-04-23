const Order = require('../models/Order');
const Article = require('../models/Article');

// Get all orders for a user
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('community', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, community, deliveryDate } = req.body;
    const userId = req.user.id;

    // Fetch all articles to get their prices
    const articleIds = items.map(item => item.article);
    const articles = await Article.find({ _id: { $in: articleIds } });
    
    // Create a map of article prices for quick lookup
    const articlePriceMap = articles.reduce((map, article) => {
      map[article._id.toString()] = article.price;
      return map;
    }, {});

    // Calculate total amount using the fetched prices
    const totalAmount = items.reduce((total, item) => {
      const articlePrice = articlePriceMap[item.article.toString()];
      if (!articlePrice) {
        throw new Error(`Price not found for article ${item.article}`);
      }
      return total + (articlePrice * item.quantity);
    }, 0);

    const order = new Order({
      user: userId,
      community,
      items,
      totalAmount,
      deliveryDate,
      status: 'pending'
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// Delete an order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

module.exports = {
  getOrders,
  createOrder,
  deleteOrder
}; 