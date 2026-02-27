const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'balls'; // Use .env in production

module.exports = (db) => {
    // Optional: Middleware to protect admin-only routes
    const authenticateAdmin = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can add users' });
        }
        req.user = decoded;
        next();
        } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
    };

    // paginated + searchable user fetch
    router.get('/all', (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const baseSql = `
        SELECT * FROM users
        WHERE name LIKE ? OR email LIKE ? OR department LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `;
    const countSql = `
        SELECT COUNT(*) AS total FROM users
        WHERE name LIKE ? OR email LIKE ? OR department LIKE ?
    `;
    const searchTerm = `%${search}%`;

    db.query(baseSql, [searchTerm, searchTerm, searchTerm, limit, offset], (err, users) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });

        db.query(countSql, [searchTerm, searchTerm, searchTerm], (err, countResult) => {
        if (err) return res.status(500).json({ message: "DB error", error: err });

        res.json({
            users,
            total: countResult[0].total,
            page,
            limit,
        });
        });
    });
    });



    // Add user manually
    router.post('/add', authenticateAdmin, async (req, res) => {
        const { email, name, department, password, role, status } = req.body;

        if (!email || !name || !department || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (email, name, department, password, role, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            email,
            name,
            department,
            hashedPassword,
            role, 
            status || 'inactive' // defaults to 'inactive'
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
            console.error('Add user error:', err);
            return res.status(500).json({ message: 'Failed to add user', error: err });
            }

            res.status(201).json({ message: 'User added successfully', userId: result.insertId });
        });
        } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
        }
    });

    // Edit user info
    router.put('/:id/edit', (req, res) => {
        const { id } = req.params;
        const {
            email,
            name,
            department,
            password,
            role,
            status,
        } = req.body;

        if (!email || !name || !department || !role || !status) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const sql = `
            UPDATE users SET email = ?, name = ?, department = ?, password = ?, role = ?, status = ? WHERE id = ?
        `;

        db.query(sql, [email, name, department, password || 'unchanged', role, status, id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err });

            if (result.affectedRows > 0) {
            return res.json({ success: true, message: 'User updated successfully' });
            } else {
            return res.status(404).json({ success: false, message: 'User not found' });
            }
        });
    });

    // Delete user
    router.delete('/:id/delete', (req, res) => {
        const { id } = req.params;

        const sql = 'DELETE FROM users WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err });

            if (result.affectedRows > 0) {
            return res.json({ success: true, message: 'User deleted successfully' });
            } else {
            return res.status(404).json({ success: false, message: 'User not found' });
            }
        });
    });



    router.put('/:id/status', (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        const sql = 'UPDATE users SET status = ? WHERE id = ?';
        db.query(sql, [status, id], (err, result) => {
            if (err) return res.status(500).send(err);

            if (result.affectedRows > 0) {
                // Optional: if you're using sockets for user updates
                if (req.io) {
                    req.io.emit('userStatusUpdated', { userId: id, status });
                }

                res.json({ success: true });
            } else {
                res.status(404).json({ success: false, message: 'User not found' });
            }
        });
    });


  return router;
};
