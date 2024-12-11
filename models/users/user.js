const { UserRole } = require('../../types');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: UserRole, default: UserRole.Client },
    created: { type: Date, default: Date.now },
});

module.exports = mongoose.model('users', userSchema);
