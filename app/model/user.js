const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    avatar: String,
    email: String,
    username: String,
    password: String
});

module.exports = mongoose.model('users', schema);