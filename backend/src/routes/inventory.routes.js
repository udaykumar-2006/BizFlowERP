const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { listStockMovements, createStockMovement } = require('../controllers/inventory.controller');

const router = Router();

const readRoles = ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'];
const writeRoles = ['ADMIN', 'WAREHOUSE'];

router.get('/', authenticate, requireRole(...readRoles), listStockMovements);
router.post('/', authenticate, requireRole(...writeRoles), createStockMovement);

module.exports = router;
