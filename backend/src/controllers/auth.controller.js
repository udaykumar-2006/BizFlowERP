const { loginSchema } = require('../validators/auth.validator');
const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      });
    }

    const { email, password } = parsed.data;
    const result = await authService.login(email, password);

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
