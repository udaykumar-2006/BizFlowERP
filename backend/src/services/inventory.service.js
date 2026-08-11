const prisma = require('../config/db');

const createStockMovement = async ({ productId, quantity, movementType, reason }, createdBy) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });

  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  if (movementType === 'OUT' && product.currentStock < quantity) {
    const error = new Error('Insufficient stock');
    error.status = 400;
    throw error;
  }

  const stockDelta = movementType === 'IN' ? quantity : -quantity;

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: { productId, quantity, movementType, reason, createdBy },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { currentStock: { increment: stockDelta } },
    }),
  ]);

  return movement;
};

const listStockMovements = async ({ page, limit }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { id: true, name: true, sku: true } } },
    }),
    prisma.stockMovement.count(),
  ]);

  return {
    data: movements,
    meta: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
  };
};

const listMovementsByProduct = async (productId, { page, limit }) => {
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });

  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { productId },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.stockMovement.count({ where: { productId } }),
  ]);

  return {
    data: movements,
    meta: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
  };
};

module.exports = { createStockMovement, listStockMovements, listMovementsByProduct };
