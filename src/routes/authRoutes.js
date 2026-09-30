const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validatorMiddleware');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  resetPasswordValidator
} = require('../validators/authValidator');

router.post('/register', registerValidator, validate, AuthController.register);
router.post('/login', loginValidator, validate, AuthController.login);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, updateProfileValidator, validate, AuthController.updateProfile);
router.post('/reset-password', resetPasswordValidator, validate, AuthController.resetPassword);

module.exports = router;
