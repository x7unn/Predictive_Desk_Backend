const express = require('express');
const UserController = require('./controller');
const { isAuthenticated, checkRole } = require('../middleware/index');
const { UserRole } = require('../../types');

class UserRoutes {
  constructor() {
    this.router = express.Router();
    this.userController = new UserController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.userController.getAllUsers.bind(this.userController)
    );

    this.router.delete('/:id',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.userController.deleteUserAndTickets.bind(this.userController)
    );

  }

  getRouter() {
    return this.router;
  }
}

module.exports = UserRoutes;
