const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createArticle,
  getAllArticles,
  getArticle,
  updateArticle,
  deleteArticle
} = require('../controllers/articleController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Article:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - unit
 *         - category
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *           minimum: 0
 *         unit:
 *           type: string
 *           enum: [kg, g, l, ml, piece, pack]
 *         category:
 *           type: string
 *           enum: [fruits, vegetables, dairy, meat, bakery, beverages, snacks, household, other]
 *         imageUrl:
 *           type: string
 *         isAvailable:
 *           type: boolean
 */

/**
 * @swagger
 * /api/article:
 *   post:
 *     summary: Create a new article
 *     tags: [Article]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       201:
 *         description: Article created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').isIn(['kg', 'g', 'l', 'ml', 'piece', 'pack']).withMessage('Invalid unit'),
  body('category').isIn(['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'beverages', 'snacks', 'household', 'other']).withMessage('Invalid category'),
  body('description').optional().isString(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('isAvailable').optional().isBoolean()
], createArticle);

/**
 * @swagger
 * /api/article:
 *   get:
 *     summary: Get all articles
 *     tags: [Article]
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 */
router.get('/', getAllArticles);

/**
 * @swagger
 * /api/article/{id}:
 *   get:
 *     summary: Get a specific article
 *     tags: [Article]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Article not found
 */
router.get('/:id', getArticle);

/**
 * @swagger
 * /api/article/{id}:
 *   put:
 *     summary: Update an article
 *     tags: [Article]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       404:
 *         description: Article not found
 */
router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').optional().isIn(['kg', 'g', 'l', 'ml', 'piece', 'pack']).withMessage('Invalid unit'),
  body('category').optional().isIn(['fruits', 'vegetables', 'dairy', 'meat', 'bakery', 'beverages', 'snacks', 'household', 'other']).withMessage('Invalid category'),
  body('description').optional().isString(),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
  body('isAvailable').optional().isBoolean()
], updateArticle);

/**
 * @swagger
 * /api/article/{id}:
 *   delete:
 *     summary: Delete an article
 *     tags: [Article]
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
 *         description: Article deleted successfully
 *       404:
 *         description: Article not found
 */
router.delete('/:id', auth, deleteArticle);

module.exports = router; 