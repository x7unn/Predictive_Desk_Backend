const express = require('express');
const TicketController = require('./controller');
const { isAuthenticated, checkRole } = require('../middleware/index');
const { UserRole } = require('../../types');


class TicketRoutes {
  constructor() {
    this.router = express.Router();
    this.ticketController = new TicketController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/',
      isAuthenticated,
      this.ticketController.getAllTickets.bind(this.ticketController)
    );

    this.router.get('/all',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.ticketController.getAllUserTickets.bind(this.ticketController)
    );

    this.router.post('/',
      isAuthenticated,
    //   checkRole(['admin', 'user', 'support']),
      this.ticketController.createTicket.bind(this.ticketController)
    );

    this.router.put('/:id',
      isAuthenticated,
    //   checkRole(['admin', 'support']),
      this.ticketController.updateTicket.bind(this.ticketController)
    );

    this.router.delete('/:id',
      isAuthenticated,
    //   checkRole(['admin', 'support']),
      this.ticketController.deleteTicket.bind(this.ticketController)
    );

    this.router.get('/monthly-tickets',
      isAuthenticated,
      // checkRole([UserRole.Admin]),
      this.ticketController.getMonhtlyTicketsCount.bind(this.ticketController)
    );

    this.router.get('/top-cards',
      isAuthenticated,
      // checkRole([UserRole.Admin]),
      this.ticketController.getAdminTopCardsData.bind(this.ticketController)
    );

    this.router.get('/employee/:id',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.ticketController.getOneEmployeesTicket.bind(this.ticketController)
    );

    this.router.get('/man-hours',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.ticketController.getManHours.bind(this.ticketController)
    );

    this.router.get('/categories',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.ticketController.getCategoriesGrouping.bind(this.ticketController)
    );

    this.router.get('/today-stats',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.ticketController.getTodayStats.bind(this.ticketController)
    );

  }

  getRouter() {
    return this.router;
  }
}

module.exports = TicketRoutes;
