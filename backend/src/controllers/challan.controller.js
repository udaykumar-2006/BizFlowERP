const { createChallanSchema, updateChallanSchema } = require('../validators/challan.validator');
const challanService = require('../services/challan.service');

const listChallans = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await challanService.listChallans({ search, page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getChallan = async (req, res, next) => {
  try {
    const challan = await challanService.getChallanById(req.params.id);
    return res.status(200).json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

const createChallan = async (req, res, next) => {
  try {
    const parsed = createChallanSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const challan = await challanService.createChallan(parsed.data, req.user.id);
    return res.status(201).json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

const updateChallan = async (req, res, next) => {
  try {
    const parsed = updateChallanSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const challan = await challanService.updateChallan(req.params.id, parsed.data);
    return res.status(200).json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

const confirmChallan = async (req, res, next) => {
  try {
    const challan = await challanService.confirmChallan(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

const cancelChallan = async (req, res, next) => {
  try {
    const challan = await challanService.cancelChallan(req.params.id);
    return res.status(200).json({ success: true, data: challan });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listChallans,
  getChallan,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
};
