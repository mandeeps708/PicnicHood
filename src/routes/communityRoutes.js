const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createCommunity,
  getAllCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  getCommunityMembers,
  updatePreferences,
  voteForDeliveryTime,
  getCommunityVotes
} = require('../controllers/communityController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         members:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 description: The ID of the user
 *               deliveryTime:
 *                 type: string
 *                 enum: [Morning, Afternoon, Evening]
 *                 description: The user's preferred delivery time
 *         preferences:
 *           type: object
 *           properties:
 *             deliveryDay:
 *               type: string
 *               enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *             deliveryTime:
 *               type: string
 *               enum: [Morning, Afternoon, Evening]
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *     CommunityCreate:
 *       type: object
 *       required:
 *         - name
 *         - location
 *       properties:
 *         name:
 *           type: string
 *         location:
 *           type: object
 *           required:
 *             - coordinates
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *               default: Point
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *               minItems: 2
 *               maxItems: 2
 *               description: [longitude, latitude]
 */

/**
 * @swagger
 * /api/community:
 *   post:
 *     summary: Create a new community
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommunityCreate'
 *     responses:
 *       201:
 *         description: Community created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Community'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('location.coordinates.*').isFloat().withMessage('Coordinates must be numbers'),
], createCommunity);

/**
 * @swagger
 * /api/community:
 *   get:
 *     summary: Get all communities
 *     tags: [Community]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of communities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Community'
 */
router.get('/', auth, getAllCommunities);

/**
 * @swagger
 * /api/community/{id}:
 *   get:
 *     summary: Get a specific community
 *     tags: [Community]
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
 *         description: Community details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Community'
 */
router.get('/:id', auth, getCommunity);

/**
 * @swagger
 * /api/community/{id}/join:
 *   post:
 *     summary: Join a community
 *     tags: [Community]
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
 *         description: Successfully joined the community
 */
router.post('/:id/join', auth, joinCommunity);

/**
 * @swagger
 * /api/community/{id}/leave:
 *   post:
 *     summary: Leave a community
 *     tags: [Community]
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
 *         description: Successfully left the community
 */
router.post('/:id/leave', auth, leaveCommunity);

/**
 * @swagger
 * /api/community/{id}/members:
 *   get:
 *     summary: Get community members
 *     tags: [Community]
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
 *         description: List of community members
 */
router.get('/:id/members', auth, getCommunityMembers);

/**
 * @swagger
 * /api/community/{id}/preferences:
 *   put:
 *     summary: Update community preferences
 *     tags: [Community]
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
 *             type: object
 *             properties:
 *               deliveryDay:
 *                 type: string
 *                 enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
 *               deliveryTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/:id/preferences', auth, [
  body('deliveryDay').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  body('deliveryTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:MM format')
], updatePreferences);

/**
 * @swagger
 * /api/community/{id}/vote:
 *   post:
 *     summary: Vote for delivery time
 *     tags: [Community]
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
 *             type: object
 *             required:
 *               - deliveryTime
 *             properties:
 *               deliveryTime:
 *                 type: string
 *                 enum: [Morning, Afternoon, Evening]
 *                 example: "Morning"
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     deliveryTime:
 *                       type: string
 *                       enum: [Morning, Afternoon, Evening]
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                       deliveryTime:
 *                         type: string
 *                         enum: [Morning, Afternoon, Evening]
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a member of the community
 *       404:
 *         description: Community not found
 *       500:
 *         description: Server error
 */
router.post('/:id/vote', auth, [
  body('deliveryTime').isIn(['Morning', 'Afternoon', 'Evening'])
    .withMessage('Invalid delivery time')
], voteForDeliveryTime);

/**
 * @swagger
 * /api/community/{id}/votes:
 *   get:
 *     summary: Get community votes
 *     tags: [Community]
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
 *         description: Community votes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: object
 *                   properties:
 *                     deliveryTime:
 *                       type: string
 *                       enum: [Morning, Afternoon, Evening]
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                       deliveryTime:
 *                         type: string
 *                         enum: [Morning, Afternoon, Evening]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Community not found
 *       500:
 *         description: Server error
 */
router.get('/:id/votes', auth, getCommunityVotes);

module.exports = router; 