const express = require('express');
const EventScheduleController = require('./controller');
const { isAuthenticated, checkRole } = require('../middleware/index');
const { UserRole } = require('../../types');

class EventScheduleRoutes {
  constructor() {
    this.router = express.Router();
    this.eventScheduleController = new EventScheduleController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.eventScheduleController.getAllEvents.bind(this.eventScheduleController)
    );

    this.router.post('/',
        isAuthenticated,
        checkRole([UserRole.Admin]),
        this.eventScheduleController.createEvent.bind(this.eventScheduleController)
      );

    this.router.delete('/:id',
    isAuthenticated,
    checkRole([UserRole.Admin]),
    this.eventScheduleController.deleteEvent.bind(this.eventScheduleController)
    );

    this.router.get('/forecast/:filter',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.eventScheduleController.getTicketsForecast.bind(this.eventScheduleController)
    );

    this.router.get('/pre-trained/:filter',
      isAuthenticated,
      checkRole([UserRole.Admin]),
      this.eventScheduleController.getPreTrainedTicketsForecast.bind(this.eventScheduleController)
    );

  }

  getRouter() {
    return this.router;
  }
}

module.exports = EventScheduleRoutes;
