const { TicketStatus, IssueUrgency, IssuePriority, IssueType } = require('../../types');
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true 
    },
    name: { 
        type: String,
        required: true,
        unique: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: TicketStatus,
        required: true
    },
    type: {
        type: String,
        enum: IssueType,
        required: true
    },
    priority: {
        type: String,
        enum: IssuePriority,
        required: true
    },
    urgency: {
        type: String,
        enum: IssueUrgency,
        required: true
    },
    expected_resolution_time: {
        type: Date,
    },
    actual_resolution_time: {
        type: Date,
        default: null
    },    
    date: { type: Date, default: Date.now }
});

const ticket = mongoose.model('tickets', ticketSchema);
module.exports = ticket;
