const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const productService = require('../services/product.service');

const listProducts = async (req, res, next) => {
  try {
    const { search, lowStock, page, limit } = req.query;
    const result = await productService.listProducts({ search, lowStock, page, limit });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const parsed = createProductSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const product = await productService.createProduct(parsed.data);
    return res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const parsed = updateProductSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const product = await productService.updateProduct(req.params.id, parsed.data);
    return res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

module.exports = { listProducts, createProduct, getProduct, updateProduct };
