const EventSchedule = require('../../models/eventSchedule/eventSchedule');
const EventScheduleService = require('../../services/components/eventSchedule/eventSchedule');
const TicketService = require('../../services/components/tickets/tickets');
const logger = require('../../config/logger');
const axios = require('axios');
const { ChartTrend } = require('../../types');
// const mongoose = require('mongoose');

class EventScheduleController {

  constructor() {
    this.logger = logger;
    this.eventScheduleService = new EventScheduleService();
    this.ticketService = new TicketService();
  }

  async getAllEvents(req, res) {
    try {
      const events = await EventSchedule.find();
      this.logger.info('Events Fetched Successfully');
      res.json({ events });
    } catch (error) {
      this.logger.error('Error fetching tickets:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async createEvent(req, res) {
    try {
      const event = new EventSchedule({
        user_id: req.user.userId,
        event_details: {
            type: req.body.eventType,
            event_name: req.body.eventName,
            date: req.body.date    
        }
      });
      const newEvent = await event.save();
      this.logger.info(`New event created with ID: ${newEvent._id}`);
      res.status(201).json(newEvent);
    } catch (error) {
      this.logger.error('Error creating event:', error);
      res.status(400).json({ message: error.message });
    }
  }
  
  async deleteEvent(req, res) {
    try {
      const event = await EventSchedule.findByIdAndDelete(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      this.logger.info(`Event deleted: ${req.params.id}`);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      this.logger.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  }

  async getTicketsForecast(req, res) {
    try {
      const { filter } = req.params;
      const currentDate = new Date();
      const nextDate = new Date();
      const prevDate = new Date();
      if (filter === ChartTrend.Monthly) {
        nextDate.setDate(currentDate.getDate() + 7);
        prevDate.setDate(currentDate.getDate() - 29);  
      } else {
        nextDate.setDate(currentDate.getDate() + 7);
        prevDate.setDate(currentDate.getDate() - 29);  
      }

      const eventsData = await this.eventScheduleService.getEvents({fromDate: prevDate, toDate: nextDate})
      const ticketsData = await this.ticketService.getTickets({fromDate: prevDate, toDate: currentDate});
      const finalData = {
        ...eventsData[0],
        ticket_data: ticketsData,
        range: filter
      };
      try {
        const predictionData = await this.eventScheduleService.fetchTicketsForecast(finalData);
        this.logger.info(`Fetched forecast successfully!`);
        res.json({ message: 'Fetched forecast successfully', data: predictionData });
      } catch (error) {
        logger.error(error);
        res.status(500).json({ message: 'Failed to forecast data' });
      }
    } catch (error) {
      this.logger.error('Error forcasting data:', error);
      res.status(500).json({ message: 'Failed to forecast data' });
    }
  }

  async getPreTrainedTicketsForecast(req, res) {
    try {
      const { filter } = req.params;
      const currentDate = new Date().toISOString().split('T')[0]
      const finalData = {
        current_date: currentDate,
        date_range: filter
      };
    try {
      const predictionData = await this.eventScheduleService.fetchPreTrainedForecast(finalData);
      this.logger.info('Fetched pre-trained forecast successfully!');
      res.json({ message: 'Fetched pre-trained forecast successfully', data: predictionData });
    } catch (error) {
      this.logger.error('Error in fetching pre-trained forecast:', error.message);
      res.status(500).json({ message: 'Failed to forecast pre-trained data' });
    }
    } catch (error) {
      this.logger.error('Error forcasting data:', error);
      res.status(500).json({ message: 'Failed to forecast pre-trained data' });
    }
  }

}

module.exports = EventScheduleController;
