const logger = require('../../config/logger');
const User = require('../../models/users/user');
const Ticket = require('../../models/tickets/ticket');
const { UserRole } = require('../../types');

class UserController {
  constructor() {
    this.logger = logger;
  }

  async getAllUsers(req, res) {
    try {
      const users = await User.find({ role: { $ne: UserRole.Admin } }).populate('email');
      this.logger.info('ALL Users Fetched Successfully');
      res.json({ users });
    } catch (error) {
      this.logger.error('Error fetching users:', error);
      res.status(500).json({ message: error.message });
    }
  }

  async deleteUserAndTickets(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const tickets = await Ticket.deleteMany({ user_id: req.params.id });
      this.logger.info(`User deleted: ${req.params.id}`);
      this.logger.info(`Tickets deleted: ${tickets.deletedCount}`);
      res.json({ 
        message: 'User and associated tickets deleted successfully'
      });
    } catch (error) {
      this.logger.error('Error deleting user and tickets:', error);
      res.status(500).json({ message: 'Failed to delete user and tickets' });
    }
  }
  
}

module.exports = UserController;
