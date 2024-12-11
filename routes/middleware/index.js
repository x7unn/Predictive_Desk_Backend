const jwt = require('jsonwebtoken');

const isAuthenticated = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
  
const checkRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }
      
      next();
    };
  };

module.exports = { isAuthenticated, checkRole };
