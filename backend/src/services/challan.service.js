const prisma = require('../config/db');
const crypto = require('crypto');

const listChallans = async ({ search, page, limit }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { challanNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {};

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true } } },
    }),
    prisma.challan.count({ where }),
  ]);

  return {
    data: challans,
    meta: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const getChallanById = async (id) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      challanItems: true,
    },
  });

  if (!challan) {
    const error = new Error('Challan not found');
    error.status = 404;
    throw error;
  }

  return challan;
};

const createChallan = async (data, createdBy) => {
  const { customerId, items } = data;

  // 1. Verify customer
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  // 4. Reject duplicate products
  const productIds = items.map((item) => item.productId);
  const uniqueProductIds = new Set(productIds);
  if (productIds.length !== uniqueProductIds.size) {
    const error = new Error('Duplicate products in challan are not allowed');
    error.status = 400;
    throw error;
  }

  // 2. Verify products
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    const error = new Error('One or more products not found');
    error.status = 404;
    throw error;
  }

  const productMap = {};
  products.forEach((p) => {
    productMap[p.id] = p;
  });

  // Calculate total quantity & prepare items with snapshot data
  let totalQuantity = 0;
  const challanItemsData = items.map((item) => {
    totalQuantity += item.quantity;
    const p = productMap[item.productId];
    return {
      productId: item.productId,
      quantity: item.quantity,
      productNameSnapshot: p.name,
      skuSnapshot: p.sku,
      unitPriceSnapshot: p.unitPrice,
    };
  });

  // 6. Generate a database-safe unique challan number using cuid/crypto
  const challanNumber = `CH-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  // 8. Create challan as DRAFT
  return prisma.challan.create({
    data: {
      challanNumber,
      customerId,
      totalQuantity,
      createdBy,
      status: 'DRAFT',
      challanItems: {
        create: challanItemsData,
      },
    },
    include: {
      challanItems: true,
    },
  });
};

const updateChallan = async (id, data) => {
  const challan = await prisma.challan.findUnique({ where: { id } });

  if (!challan) {
    const error = new Error('Challan not found');
    error.status = 404;
    throw error;
  }

  if (challan.status !== 'DRAFT') {
    const error = new Error('Only DRAFT challans can be edited');
    error.status = 400;
    throw error;
  }

  return prisma.challan.update({
    where: { id },
    data,
  });
};

const confirmChallan = async (id, createdBy) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: { challanItems: true },
  });

  if (!challan) {
    const error = new Error('Challan not found');
    error.status = 404;
    throw error;
  }

  if (challan.status !== 'DRAFT') {
    const error = new Error('Only DRAFT challans can be confirmed');
    error.status = 400;
    throw error;
  }

  if (challan.challanItems.length === 0) {
    const error = new Error('Cannot confirm challan without items');
    error.status = 400;
    throw error;
  }

  const productIds = challan.challanItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  if (products.length !== productIds.length) {
    const error = new Error('One or more products not found');
    error.status = 404;
    throw error;
  }

  const productMap = {};
  products.forEach((p) => {
    productMap[p.id] = p;
  });

  // Check sufficient stock for every product
  for (const item of challan.challanItems) {
    const currentStock = productMap[item.productId].currentStock;
    if (currentStock < item.quantity) {
      const error = new Error('Insufficient stock');
      error.status = 400;
      throw error;
    }
  }

  // Transaction: Reduce stock, create movements, update status
  const transactionOps = [];

  for (const item of challan.challanItems) {
    transactionOps.push(
      prisma.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      })
    );

    transactionOps.push(
      prisma.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: 'OUT',
          reason: `Challan confirmation: ${challan.challanNumber}`,
          createdBy,
        },
      })
    );
  }

  transactionOps.push(
    prisma.challan.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    })
  );

  await prisma.$transaction(transactionOps);

  return prisma.challan.findUnique({
    where: { id },
    include: { challanItems: true },
  });
};

const cancelChallan = async (id) => {
  const challan = await prisma.challan.findUnique({ where: { id } });

  if (!challan) {
    const error = new Error('Challan not found');
    error.status = 404;
    throw error;
  }

  if (challan.status !== 'DRAFT') {
    const error = new Error('Only DRAFT challans can be cancelled');
    error.status = 400;
    throw error;
  }

  return prisma.challan.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
};

module.exports = {
  listChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
};
