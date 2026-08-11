const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { listProducts, createProduct, getProduct, updateProduct } = require('../controllers/product.controller');
const { listMovementsByProduct } = require('../controllers/inventory.controller');

const router = Router();

const readRoles = ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'];
const writeRoles = ['ADMIN', 'WAREHOUSE'];

router.get('/', authenticate, requireRole(...readRoles), listProducts);
router.post('/', authenticate, requireRole(...writeRoles), createProduct);
router.get('/:id', authenticate, requireRole(...readRoles), getProduct);
router.patch('/:id', authenticate, requireRole(...writeRoles), updateProduct);

router.get('/:id/stock-movements', authenticate, requireRole(...readRoles), listMovementsByProduct);

module.exports = router;
