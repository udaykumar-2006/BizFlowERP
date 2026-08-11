const { Router } = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  listChallans,
  getChallan,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
} = require('../controllers/challan.controller');

const router = Router();

const readRoles = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];
const writeRoles = ['ADMIN', 'SALES'];

router.get('/', authenticate, requireRole(...readRoles), listChallans);
router.post('/', authenticate, requireRole(...writeRoles), createChallan);
router.get('/:id', authenticate, requireRole(...readRoles), getChallan);
router.patch('/:id', authenticate, requireRole(...writeRoles), updateChallan);

router.post('/:id/confirm', authenticate, requireRole(...writeRoles), confirmChallan);
router.post('/:id/cancel', authenticate, requireRole(...writeRoles), cancelChallan);

module.exports = router;
