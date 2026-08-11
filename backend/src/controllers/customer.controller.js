const { createCustomerSchema, updateCustomerSchema, createFollowUpSchema } = require('../validators/customer.validator');
const customerService = require('../services/customer.service');

const listCustomers = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;
    const result = await customerService.listCustomers({ search, page, limit });
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const parsed = createCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const customer = await customerService.createCustomer(parsed.data);
    return res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
};

const getCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const parsed = updateCustomerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const customer = await customerService.updateCustomer(req.params.id, parsed.data);
    return res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
};

const listFollowUps = async (req, res, next) => {
  try {
    const followUps = await customerService.listFollowUps(req.params.id);
    return res.status(200).json(followUps);
  } catch (err) {
    next(err);
  }
};

const createFollowUp = async (req, res, next) => {
  try {
    const parsed = createFollowUpSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const followUp = await customerService.createFollowUp(req.params.id, parsed.data, req.user.id);
    return res.status(201).json(followUp);
  } catch (err) {
    next(err);
  }
};

module.exports = { listCustomers, createCustomer, getCustomer, updateCustomer, listFollowUps, createFollowUp };
