const { TicketStatus, IssueUrgency, IssuePriority, IssueType } = require('../../types');
const mongoose = require('mongoose');

const event = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    event_name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true 
    }
}, {_id: false});

const eventScheduleSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true 
    },
    event_details: { 
        type: event,
        required: true,
        unique: true 
    },
});

const ticket = mongoose.model('event_schedule', eventScheduleSchema);
module.exports = ticket;
