// backend/models/GeofenceBreach.js
const mongoose = require('mongoose');

const geofenceBreachSchema = new mongoose.Schema({
    tourist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    zoneName: { type: String, required: true },
    zoneType: {
        type: String,
        enum: ['restricted', 'high_risk', 'natural_hazard'],
        default: 'high_risk'
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number]  // [longitude, latitude]
    },
    timestamp: { type: Date, default: Date.now },
    txHash: { type: String, default: null },
    resolved: { type: Boolean, default: false }
});

geofenceBreachSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('GeofenceBreach', geofenceBreachSchema);
