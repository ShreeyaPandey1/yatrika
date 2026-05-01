// backend/routes/geofenceRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const GeofenceBreach = require('../models/GeofenceBreach');
const blockchainService = require('../services/blockchainService');
const logger = require('../utils/logger');

// POST /api/geofence/breach
// Called by frontend when tourist enters a danger zone
router.post('/breach', protect, async (req, res) => {
    try {
        const { zoneName, zoneType, latitude, longitude, timestamp } = req.body;
        const userId = req.user._id;

        // 1. Save to MongoDB
        const breach = await GeofenceBreach.create({
            tourist: userId,
            zoneName,
            zoneType,
            location: { type: 'Point', coordinates: [longitude, latitude] },
            timestamp: timestamp || new Date()
        });

        logger.info(`Geofence breach: user=${userId} zone=${zoneName}`);

        // 2. Emit to police dashboard via socket.io
        const io = req.app.get('io');
        if (io) {
            io.emit('geofence_breach', {
                touristId: userId,
                zoneName,
                zoneType,
                latitude,
                longitude,
                timestamp: breach.timestamp
            });
        }

        // 3. Log to blockchain
        let txHash = null;
        try {
            const tx = await blockchainService.logGeofenceBreach(
                userId.toString(),
                zoneName,
                Math.floor(latitude * 1e6),
                Math.floor(longitude * 1e6)
            );
            txHash = tx.hash;
            logger.info(`Geofence breach on-chain: ${txHash}`);
        } catch (bcErr) {
            logger.warn(`Blockchain log failed: ${bcErr.message}`);
        }

        res.status(201).json({ success: true, breachId: breach._id, txHash });
    } catch (err) {
        logger.error(err);
        res.status(500).json({ message: 'Geofence breach recording failed' });
    }
});

// GET /api/geofence/zones
// Returns all defined danger zones for the frontend to load
router.get('/zones', protect, (req, res) => {
    // Hardcoded zones — in production these come from DB
    res.json({ zones: DANGER_ZONES });
});

// Danger zones — polygons defined as arrays of [lat, lng]
const DANGER_ZONES = [
    {
        id: 'dz_001',
        name: 'Restricted Forest Zone — Corbett Buffer',
        type: 'restricted',
        color: '#ef4444',
        polygon: [
            [29.5300, 78.7400],
            [29.5300, 78.8200],
            [29.4700, 78.8200],
            [29.4700, 78.7400]
        ]
    },
    {
        id: 'dz_002',
        name: 'High Crime Zone — Example Area',
        type: 'high_risk',
        color: '#f97316',
        polygon: [
            [28.6500, 77.2200],
            [28.6500, 77.2400],
            [28.6350, 77.2400],
            [28.6350, 77.2200]
        ]
    },
    {
        id: 'dz_003',
        name: 'Flood Prone Zone — Brahmaputra Bank',
        type: 'natural_hazard',
        color: '#3b82f6',
        polygon: [
            [26.1800, 91.7300],
            [26.1800, 91.7700],
            [26.1500, 91.7700],
            [26.1500, 91.7300]
        ]
    }
];

module.exports = router;
module.exports.DANGER_ZONES = DANGER_ZONES;
