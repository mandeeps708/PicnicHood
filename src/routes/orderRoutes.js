const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getOrders, createOrder, deleteOrder } = require('../controllers/orderController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       required:
 *         - article
 *         - quantity
 *       properties:
 *         article:
 *           type: string
 *           description: ID of the article being ordered
 *         quantity:
 *           type: number
 *           minimum: 1
 *           description: Quantity of the article
 *     Order:
 *       type: object
 *       required:
 *         - items
 *         - community
 *         - deliveryDate
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         community:
 *           type: string
 *           description: ID of the community
 *         deliveryDate:
 *           type: string
 *           format: date-time
 *           description: Expected delivery date
 *         status:
 *           type: string
 *           enum: [pending, processing, delivered, cancelled]
 *           default: pending
 *           description: Status of the order
 *         totalAmount:
 *           type: number
 *           description: Total amount of the order
 *     OrderResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         community:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               article:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *               quantity:
 *                 type: number
 *         totalAmount:
 *           type: number
 *         status:
 *           type: string
 *         deliveryDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/order:
 *   get:
 *     summary: Get all orders for the current user
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get('/', auth, getOrders);

/**
 * @swagger
 * /api/order/:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', auth, [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.article').isMongoId().withMessage('Invalid article ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('community').isMongoId().withMessage('Invalid community ID'),
  body('deliveryDate').isISO8601().withMessage('Invalid delivery date format')
], createOrder);

/**
 * @swagger
 * /api/order/{id}/delete:
 *   delete:
 *     summary: Delete an order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/:id/delete', auth, deleteOrder);

module.exports = router; 