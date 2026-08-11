const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  listCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  listFollowUps,
  createFollowUp,
} = require('../controllers/customer.controller');

const router = Router();

const readRoles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
const writeRoles = ['ADMIN', 'SALES'];

router.get('/', authenticate, requireRole(...readRoles), listCustomers);
router.post('/', authenticate, requireRole(...writeRoles), createCustomer);
router.get('/:id', authenticate, requireRole(...readRoles), getCustomer);
router.patch('/:id', authenticate, requireRole(...writeRoles), updateCustomer);

router.get('/:id/followups', authenticate, requireRole(...readRoles), listFollowUps);
router.post('/:id/followups', authenticate, requireRole(...writeRoles), createFollowUp);

module.exports = router;
