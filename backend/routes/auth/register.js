const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');
const router = express.Router();

module.exports = (db) => {
    router.post('/', async (req, res) => {
        const { email, username, department, password } = req.body;

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) return res.status(500).send(err);

                if (results.length > 0) {
                    return res.status(400).json({ success: false, message: 'Email already in use' });
                }

                // ✅ Now insert the user
                const sql = 'INSERT INTO users (email, name, department, password) VALUES (?, ?, ?, ?)';
                db.query(sql, [email, username, department, hashedPassword], (err, insertResult) => {
                    if (err) return res.status(500).send(err);
                    res.json({ success: true, id: insertResult.insertId });
                });
            });
        } catch (error) {
            console.error('Hashing failed:', error);
            res.status(500).send('Internal server error');
        }
    });

    return router;
};
