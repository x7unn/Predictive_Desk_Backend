const logger = require('../../../config/logger');
const EventSchedule = require('../../../models/eventSchedule/eventSchedule');
const axios = require('axios');

class EventScheduleService {
    constructor(model = EventSchedule) {
        this.logger = logger;
        this.model = model;
    }

    async getEvents(dateFilter) {
        try {
            const { fromDate, toDate } = dateFilter;
            if (!fromDate || !toDate) {
                throw new Error("Both fromDate and toDate must be provided in dateFilter");
            }
            const events = await this.model.aggregate([
                {
                    $match: {
                        "event_details.date": {
                            $gte: new Date(fromDate),
                            $lte: new Date(toDate),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            type: "$event_details.type",
                            date: {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$event_details.date"
                                }
                            },
                            name: "$event_details.event_name"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id.type",
                        events: {
                            $push: {
                                k: "$_id.date",
                                v: "$_id.name"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        type: "$_id",
                        events: { $arrayToObject: "$events" }
                    }
                },
                {
                    $facet: {
                        holidays: [
                            { 
                                $match: { 
                                    type: { $regex: /holiday/i } 
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    events: 1
                                }
                            },
                            { $limit: 1 }
                        ],
                        product_launches: [
                            { 
                                $match: { 
                                    type: { $regex: /product|release/i } 
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    events: 1
                                }
                            },
                            { $limit: 1 }
                        ]
                    }
                },
                {
                    $project: {
                        holidays: { $ifNull: [{ $first: "$holidays.events" }, {}] },
                        product_launches: { $ifNull: [{ $first: "$product_launches.events" }, {}] }
                    }
                }
            ]);
            return events;
        } catch (error) {
            throw new Error(`Error fetching data: ${error.message}`);
        }
    }

    async fetchPreTrainedForecast(finalData) {
        try {
          const response = await axios.post(
            'http://127.0.0.1:5000/predict_ticket_volume_using_external',
            finalData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          return response.data;
        } catch (error) {
          this.logger.error('Error fetching pre-trained forecast:', error.message);
          throw new Error('Failed to fetch pre-trained forecast');
        }
    }

    
    async fetchTicketsForecast(finalData) {
        try {
            const response = await axios.post(
              'http://127.0.0.1:5000/predict_ticket_volume',
              finalData,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            return response.data;
          } catch (error) {
            console.error('Error fetching tickets forecast:', error.message);
            throw new Error('Failed to fetch tickets forecast');
          }
    }

}

module.exports = EventScheduleService;
