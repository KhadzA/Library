const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'balls'; // In production, put this in .env

module.exports = (db) => {
    // To authenticate routes
    const authenticateToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: 'Token invalid or expired' });
            req.user = user;
            next();
        });
    };

    // 
    router.post('/active-status', authenticateToken, (req, res) => {
        const userId = req.user.id;
        const sql = 'UPDATE users SET status = ? WHERE id = ?';
        db.query(sql, ['active', userId], (err, result) => {
            if (err) return res.status(500).send('Database error');
            res.json({ success: true, message: 'status updated!' });
        });
    });

    router.post('/inactive-status', authenticateToken, (req, res) => {
        const userId = req.user.id;
        const sql = 'UPDATE users SET status = ? WHERE id = ?';
        db.query(sql, ['inactive', userId], (err, result) => {
            if (err) return res.status(500).send('Database error');
            res.json({ success: true, message: 'status updated!' });
        });
    });


    return router;
};

