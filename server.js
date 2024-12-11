// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const logger = require('./config/logger');
// const authRoutes = require('./routes/auth/index')
const TicketRoutes = require ('./routes/tickets/routes');
const AuthRoutes = require ('./routes/auth/routes')
const UserRoutes = require ('./routes/users/routes');
const EventScheduleRoutes = require('./routes/eventSchedule/routes')

require('dotenv').config();
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const ticketRoutes = new TicketRoutes();
const authRoutes = new AuthRoutes();
const userRoutes = new UserRoutes();
const eventScheduleRoutes = new EventScheduleRoutes();

app.use(express.json());

// Middleware
const allowedOrigins = process.env.CORS.split(','); // Split the CORS env variable into an array

app.use(cors({
  origin: allowedOrigins, // Use the array of allowed origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials if needed
}));

app.use('/api', authRoutes.getRouter());
app.use('/api/tickets', ticketRoutes.getRouter());
app.use('/api/users', userRoutes.getRouter());
app.use('/api/event-schedule', eventScheduleRoutes.getRouter());

app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.send("API is running...");
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).send('Server error');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
