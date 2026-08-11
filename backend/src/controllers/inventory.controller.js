const { createStockMovementSchema } = require('../validators/inventory.validator');
const inventoryService = require('../services/inventory.service');

const listStockMovements = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await inventoryService.listStockMovements({ page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const createStockMovement = async (req, res, next) => {
  try {
    const parsed = createStockMovementSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const movement = await inventoryService.createStockMovement(parsed.data, req.user.id);
    return res.status(201).json({ success: true, data: movement });
  } catch (err) {
    next(err);
  }
};

const listMovementsByProduct = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await inventoryService.listMovementsByProduct(req.params.id, { page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { listStockMovements, createStockMovement, listMovementsByProduct };
