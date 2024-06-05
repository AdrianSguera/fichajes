const mongoose = require('mongoose');

const FichajeSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    dni: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    status: { type: String, required: true}
});

module.exports = mongoose.model('Fichaje', FichajeSchema);