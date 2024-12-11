const { TicketStatus, UserRole, ChartTrend } = require('../../types');
const Ticket = require('../../models/tickets/ticket');
const logger = require('../../config/logger');
const axios = require('axios');
const mongoose = require('mongoose');
const ticket = require('../../models/eventSchedule/eventSchedule');
const TicketService = require('../../services/components/tickets/tickets');
const EventScheduleService = require('../../services/components/eventSchedule/eventSchedule');

class TicketController {
  constructor() {
    this.logger = logger;
    this.ticketService = new TicketService();
    this.eventScheduleService = new EventScheduleService();
  }

  async getAllTickets(req, res) {
    try {
      const { userId } = req.user;
      const tickets = await Ticket.find({ user_id: new mongoose.Types.ObjectId(userId) });

      const stats = {
        totalTickets: tickets.length,
        activeTickets: tickets.filter(t => t.status === TicketStatus.Active).length,
        resolvedTickets: tickets.filter(t => t.status === TicketStatus.Resolved).length,
        pendingTickets: tickets.filter(t => t.status === TicketStatus.Pending).length,
        inProgressTickets: tickets.filter(t => t.status === TicketStatus.InProgress).length,
      };
      this.logger.info('Tickets Fetched Successfully');
      res.json({ tickets, stats });
    } catch (error) {
      this.logger.error('Error fetching tickets:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getAllUserTickets(req, res) {
    try {
      const tickets = await Ticket.find().populate('user_id');
      this.logger.info('ALL Tickets Fetched Successfully');
      res.json({ tickets });
    } catch (error) {
      this.logger.error('Error fetching tickets:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async createTicket(req, res) {
    try {
      const currentTime = Date.now();
      const ticket = new Ticket({
        user_id: req.user.userId,
        name: req.body.name,
        description: req.body.description,
        status: req.body.status || TicketStatus.Active,
        type: req.body.type,
        priority: req.body.priority,
        urgency: req.body.urgency,
        date: currentTime
      });

      const data = {
        'Issue Type': req.body.type,
        'Urgency': req.body.urgency,
        'Priority': req.body.priority,
        'Current Ticket Volume': 1000,
        'Holiday Season': 1,
        'Product Launch Near': 0
      };
      const predictionResponse = await axios.get('http://127.0.0.1:5000/predict', {
        params: data
      });
      const resolutionTimeInHours = predictionResponse.data.resolution_time;
      const resolutionTimeInMilliseconds = resolutionTimeInHours * 60 * 60 * 1000;
      const expectedResolutionDate = new Date(currentTime + resolutionTimeInMilliseconds);
    
      ticket.expected_resolution_time = expectedResolutionDate;
      const newTicket = await ticket.save();
      this.logger.info(`New ticket created with ID: ${newTicket._id}`);
      res.status(201).json(newTicket);
    } catch (error) {
      this.logger.error('Error creating ticket:', error);
      res.status(400).json({ message: error.message });
    }
  }

  async updateTicket(req, res) {
    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
  
      const fieldsToCheck = ['priority', 'type', 'urgency'];
      const shouldUpdateResolutionTime = fieldsToCheck.some(field => ticket[field] !== req.body[field]);
      
      if (req.body.status === TicketStatus.Resolved && !req.body.actual_resolution_time) {
        return res.status(400).json({ message: 'Actual Resolution Time is required when status is resolved' });
      }
      Object.assign(ticket, req.body);
  
      if (shouldUpdateResolutionTime) {
        const data = {
          'Issue Type': req.body.type,
          'Urgency': req.body.urgency,
          'Priority': req.body.priority,
          'Current Ticket Volume': 1000,
          'Holiday Season': 1,
          'Product Launch Near': 0
        };
  
        try {
          const predictionResponse = await axios.get('http://127.0.0.1:5000/predict', { params: data });
          const resolutionTimeInHours = predictionResponse.data.resolution_time;
          const resolutionTimeInMilliseconds = resolutionTimeInHours * 60 * 60 * 1000;
          const currentTime = Date.now();
          ticket.date = currentTime;          
          ticket.expected_resolution_time = new Date(currentTime + resolutionTimeInMilliseconds);
          ticket.actual_resolution_time = null;
        } catch (apiError) {
          this.logger.error('Error calling resolution time API:', apiError);
          return res.status(500).json({ message: 'Failed to calculate resolution time' });
        }
      }
  
      const updatedTicket = await ticket.save();
      this.logger.info(`Ticket updated: ${req.params.id}`);
      res.json(updatedTicket);
    } catch (error) {
      this.logger.error('Error updating ticket:', error);
      res.status(400).json({ message: error.message });
    }
  }
  
  async deleteTicket(req, res) {
    try {
      const ticket = await Ticket.findByIdAndDelete(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      this.logger.info(`Ticket deleted: ${req.params.id}`);
      res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
      this.logger.error('Error deleting ticket:', error);
      res.status(500).json({ message: 'Failed to delete ticket' });
    }
  }

  async getMonhtlyTicketsCount(req, res) {
    try {
      const { userId, role } = req.user;
      const currentDate = new Date();
      const prevDate = new Date();
      prevDate.setDate(currentDate.getDate() - 29);
      if (role === UserRole.Admin) {
        const tickets = await this.ticketService.getTickets({fromDate: prevDate, toDate: currentDate});
        res.json(tickets);  
      } else {
        const tickets = await this.ticketService.getTickets({fromDate: prevDate, toDate: currentDate, userId: userId});
        res.json(tickets);  
      }
     } catch (error) {
      this.logger.error('Error fetching data:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async getAdminTopCardsData(req, res) {
      try {
        const { userId, role } = req.user;
        if (role === UserRole.Admin) {
          const tickets = await Ticket.find();
          const stats = {
            totalTickets: tickets.length,
            activeTickets: tickets.filter(t => t.status === TicketStatus.Active).length,
            resolvedTickets: tickets.filter(t => t.status === TicketStatus.Resolved).length,
            pendingTickets: tickets.filter(t => t.status === TicketStatus.Pending).length,
            inProgressTickets: tickets.filter(t => t.status === TicketStatus.InProgress).length,
          };
          this.logger.info('Tickets Top Card Data Fetched Successfully');
          res.json({ stats });  
        } else {
          const tickets = await Ticket.find({ user_id: new mongoose.Types.ObjectId(userId) });
          const stats = {
            totalTickets: tickets.length,
            activeTickets: tickets.filter(t => t.status === TicketStatus.Active).length,
            resolvedTickets: tickets.filter(t => t.status === TicketStatus.Resolved).length,
            pendingTickets: tickets.filter(t => t.status === TicketStatus.Pending).length,
            inProgressTickets: tickets.filter(t => t.status === TicketStatus.InProgress).length,
          };
          this.logger.info('Tickets Top Card Data Fetched Successfully');
          res.json({ stats });  
        }
      } catch (error) {
        this.logger.error('Error fetching tickets top cards data:', error);
        res.status(500).json({ message: error.message });
      }
    }

    async getOneEmployeesTicket(req, res) {
      try {
        const { id } = req.params;
        const tickets = await Ticket.find({ user_id: new mongoose.Types.ObjectId(id) });
          this.logger.info(`Tickets Fetched against userID ${id} Successfully`);
        res.json({ tickets });
      } catch (error) {
        this.logger.error('Error fetching tickets:', error);
        res.status(500).json({ message: error.message });
      }
    }

    async getManHours(req, res) {
      try {
        const currentDate = new Date();
        const nextDate = new Date();
        const prevDate = new Date();
        nextDate.setDate(currentDate.getDate() + 7);
        prevDate.setDate(currentDate.getDate() - 29);  
        const eventsData = await this.eventScheduleService.getEvents({fromDate: prevDate, toDate: nextDate})
        const ticketsData = await this.ticketService.getTickets({fromDate: prevDate, toDate: currentDate});
        const ticketDetails = await this.ticketService.getTicketsDetail({fromDate: prevDate, toDate: currentDate});
        const resolvedTickets = ticketDetails.filter(ticket => 
          ticket.status === TicketStatus.Resolved);
        
        const totalResolutionTime = resolvedTickets.reduce((acc, ticket) => {
          const createdAt = new Date(ticket.date);
          const resolvedAt = new Date(ticket.actual_resolution_time);
          const resolutionTime = (resolvedAt - createdAt) / (1000 * 60 * 60);
          this.logger.info(resolutionTime);
          return acc + resolutionTime;
        }, 0);
    
        const averageResolutionTime = resolvedTickets.length > 0
          ? totalResolutionTime / resolvedTickets.length
          : 0;    
        const finaldataInternal = {
          ...eventsData[0],
          ticket_data: ticketsData,
          range: ChartTrend.Monthly
        };
        const currentDateExternal = new Date().toISOString().split('T')[0]
        const finalDataExternal = {
          current_date: currentDateExternal,
          date_range: ChartTrend.Monthly
        };
  
        const predictionDataInternal = await this.eventScheduleService.fetchTicketsForecast(finaldataInternal);
        const predictionDataExternal = await this.eventScheduleService.fetchPreTrainedForecast(finalDataExternal);

        const averagedPredictionData = this.ticketService.mergeAndAverageForecasts(predictionDataInternal, predictionDataExternal);
        res.json({ message: 'Fetched Man Hours successfully', data: { ticketsVolume: averagedPredictionData, averageTime: averageResolutionTime }});

      } catch (error) {
        this.logger.error('Error fetching tickets:', error);
        res.status(500).json({ message: error.message });
      }
    }

    async getCategoriesGrouping(req, res) {
      try {
        const tickets = await Ticket.aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $project: { _id: 0, type: "$_id", count: 1 } }
        ]);
        this.logger.info(`Tickets grouped by type fetched successfully`);
        res.json({ tickets });
      } catch (error) {
        this.logger.error('Error fetching grouped tickets:', error);
        res.status(500).json({ message: error.message });
      }
    }

    async getTodayStats(req, res) {
      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        
        const [todayTicketsCount, resolvedTicketsCount, avgResolutionTime] = await Promise.all([
          Ticket.countDocuments({
            date: { $gte: startOfDay }
          }),
          Ticket.countDocuments({ status: TicketStatus.Resolved, actual_resolution_time: { $gte: startOfDay } }),
          Ticket.aggregate([
            { $match: { status: TicketStatus.Resolved, actual_resolution_time: { $exists: true } } },
            {
              $project: {
                resolutionTime: { $subtract: ["$actual_resolution_time", "$date"] }
              }
            },
            {
              $group: {
                _id: null,
                avgResolutionTime: { $avg: "$resolutionTime" }
              }
            }
          ])
        ]);
    
        const averageResolutionTime = avgResolutionTime.length > 0 
          ? Math.floor(avgResolutionTime[0].avgResolutionTime / (1000 * 60)) // Convert ms to minutes
          : 0;
    
        this.logger.info('Today\'s ticket stats fetched successfully');
    
        res.json({data: {
          ticketsSubmittedToday: todayTicketsCount,
          ticketsResolved: resolvedTicketsCount,
          averageResolutionTime: `${Math.floor(averageResolutionTime / 60)}h ${averageResolutionTime % 60}m`
        }});
      } catch (error) {
        this.logger.error('Error fetching today\'s ticket stats:', error);
        res.status(500).json({ message: error.message });
      }
    }
    
}
module.exports = TicketController;
