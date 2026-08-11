const prisma = require('../config/db');

const listProducts = async ({ search, lowStock, page, limit }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  const searchWhere = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  if (lowStock === 'true') {
    const allMatching = await prisma.product.findMany({
      where: searchWhere,
      orderBy: { createdAt: 'desc' },
    });

    const filtered = allMatching.filter((p) => p.currentStock <= p.minimumStock);
    const total = filtered.length;
    const data = filtered.slice(skip, skip + pageSize);

    return {
      data,
      meta: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: searchWhere,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: searchWhere }),
  ]);

  return {
    data: products,
    meta: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
  };
};

const createProduct = async (data) => {
  return prisma.product.create({ data });
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return product;
};

const updateProduct = async (id, data) => {
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });

  if (!exists) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return prisma.product.update({ where: { id }, data });
};

module.exports = { listProducts, createProduct, getProductById, updateProduct };
