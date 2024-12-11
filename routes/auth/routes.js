const express = require('express');
const { check } = require('express-validator');
const AuthController = require('./controller');


class AuthRoutes {
  constructor() {
    this.router = express.Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/signup',
        [
            check('username', 'Username is required').not().isEmpty(),
            check('email', 'Please include a valid email').isEmail(),
            check('password', 'Password should be at least 6 characters').isLength({ min: 6 })
        ],
      this.authController.signUp.bind(this.authController)
    );

    this.router.post('/login',
        [
            check('email', 'Please include a valid email').isEmail(),
            check('password', 'Password is required').exists()
        ],
      this.authController.login.bind(this.authController)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = AuthRoutes;
