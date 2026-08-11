const prisma = require('../config/db');

const listCustomers = async ({ search, page, limit }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * pageSize;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { mobile: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        mobile: true,
        email: true,
        businessName: true,
        customerType: true,
        status: true,
        followUpDate: true,
        createdAt: true,
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    meta: {
      total,
      page: pageNum,
      limit: pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const createCustomer = async (data) => {
  return prisma.customer.create({ data });
};

const getCustomerById = async (id) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { followUps: { orderBy: { createdAt: 'desc' } } },
  });

  if (!customer) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  return customer;
};

const updateCustomer = async (id, data) => {
  const exists = await prisma.customer.findUnique({ where: { id }, select: { id: true } });

  if (!exists) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  return prisma.customer.update({ where: { id }, data });
};

const listFollowUps = async (customerId) => {
  const exists = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });

  if (!exists) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  return prisma.customerFollowUp.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  });
};

const createFollowUp = async (customerId, { note, followUpDate }, createdBy) => {
  const exists = await prisma.customer.findUnique({ where: { id: customerId }, select: { id: true } });

  if (!exists) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  return prisma.customerFollowUp.create({
    data: { customerId, note, followUpDate: new Date(followUpDate), createdBy },
  });
};

module.exports = { listCustomers, createCustomer, getCustomerById, updateCustomer, listFollowUps, createFollowUp };
