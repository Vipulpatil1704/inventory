import express from 'express';
import inventoryController from '../controllers/inventoryController.js';
import validate from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
  stockAdjustSchema,
  historyQuerySchema,
} from '../validators/inventoryValidators.js';

const router = express.Router();

router.use(authenticate);

/**
 * @openapi
 * /inventory/{productId}/increase:
 *   post:
 *     tags: [Inventory]
 *     summary: Increase product stock
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1 }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Stock increased
 */
router.post(
  '/:productId/increase',
  authorize('admin', 'staff'),
  validate(stockAdjustSchema),
  inventoryController.increaseStock
);

/**
 * @openapi
 * /inventory/{productId}/decrease:
 *   post:
 *     tags: [Inventory]
 *     summary: Decrease product stock
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 1 }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Stock decreased
 *       400:
 *         description: Insufficient stock
 */
router.post(
  '/:productId/decrease',
  authorize('admin', 'staff'),
  validate(stockAdjustSchema),
  inventoryController.decreaseStock
);

/**
 * @openapi
 * /inventory/{productId}/history:
 *   get:
 *     tags: [Inventory]
 *     summary: Get stock history for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Transaction history
 */
router.get(
  '/:productId/history',
  validate(historyQuerySchema, 'query'),
  inventoryController.getStockHistory
);

export default router;
