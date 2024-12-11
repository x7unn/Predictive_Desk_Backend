const Tickets = require('../../../models/tickets/ticket');
const mongoose = require('mongoose');
const logger = require('../../../config/logger');

class TicketService {
    constructor(model = Tickets) {
        this.model = model;
        this.logger = logger;
    }

    async getTickets(dateFilter) {
        try {
          const { fromDate, toDate, userId } = dateFilter;
          if (!fromDate || !toDate) {
            throw new Error("Both fromDate and toDate must be provided in dateFilter");
          }      
          const startDate = new Date(fromDate);
          const endDate = new Date(toDate);
          const matchStage = {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          };
        
          if (userId) {
            matchStage.user_id = new mongoose.Types.ObjectId(userId);
          }
          const tickets = await this.model.aggregate([
            {
              $match: matchStage
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$date" }
                },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                _id: 0,
                date: "$_id",
                count: 1
              }
            }
          ]);
          const ticketData = this.organizeTicketsByCount(startDate, endDate, tickets);
      
          return ticketData;
        } catch (error) {
          throw new Error(`Error fetching data: ${error.message}`);
        }
      }

      async getTicketsDetail(dateFilter) {
        try {
          const { fromDate, toDate } = dateFilter;
          if (!fromDate || !toDate) {
            throw new Error("Both fromDate and toDate must be provided in dateFilter");
          }      
          const startDate = new Date(fromDate);
          const endDate = new Date(toDate);
          const matchStage = {
            date: {
              $gte: startDate,
              $lte: endDate,
            },
          };
          const tickets = await this.model.aggregate([
            {
              $match: matchStage
            }
          ]);
          return tickets;
        } catch (error) {
          throw new Error(`Error fetching data: ${error.message}`);
        }
      }

    organizeTicketsByCount(startDate, endDate, tickets) {
        const ticketCounts = {};
    
        tickets.forEach(({ date, count }) => {
        ticketCounts[date] = count;
        });
    
        const result = {};
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        result[dateString] = ticketCounts[dateString] || 0;
        currentDate.setDate(currentDate.getDate() + 1);
        }
        return result;
    }

    mergeAndAverageForecasts(internalData, externalData) {
      if (internalData.length !== externalData.length) {
        throw new Error("Data arrays must have the same length for averaging.");
      }
    
      let sum = 0;
      const averagedData = internalData.map((internalItem, index) => {
        const externalItem = externalData[index];    
        if (internalItem.date !== externalItem.date) {
          throw new Error(`Mismatched dates: ${internalItem.date} and ${externalItem.date}`);
        }
        const averageVolume = (internalItem.forecasted_value + externalItem.forecasted_value) / 2;
        sum = sum + averageVolume;
        return {
          date: internalItem.date,
          forecasted_value: Math.round(averageVolume),
        };
      });
    return sum;
    }
    
}

module.exports = TicketService;
