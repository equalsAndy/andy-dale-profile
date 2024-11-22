const db = require('../db');

// Function to add an email for a user
const addEmail = (req, res) => {
   
    const { userId, emailAddress, isPrimary } = req.body;

    if (!userId || !emailAddress) {
        return res.status(400).send('userId and emailAddress are required');
    }

    const sql = 'INSERT INTO emails (user_id, email_address, is_primary) VALUES (?, ?, ?)';
    const params = [userId, emailAddress, isPrimary || 0];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error adding email:', err);
            return res.status(500).send('Error adding email');
        }
        res.status(201).json({ emailId: results.insertId, message: 'Email added successfully' });
    });

};

// Function to update an email for a user
const updateEmail = (req, res) => {

    const { emailId, emailAddress, isPrimary, verified } = req.body;

    if (!emailId) {
        return res.status(400).send('emailId is required');
    }

    const sql = 'UPDATE emails SET email_address = ?, is_primary = ?, verified = ? WHERE email_id = ?';
    const params = [emailAddress, isPrimary || 0, verified || 0, emailId];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error updating email:', err);
            return res.status(500).send('Error updating email');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Email not found');
        }

        res.send('Email updated successfully');
    });

};

// Function to delete an email
const deleteEmail = (req, res) => {
    const { emailId } = req.params;

    if (!emailId) {
        return res.status(400).send('emailId is required');
    }

    const sql = 'DELETE FROM emails WHERE email_id = ?';
    const params = [emailId];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error deleting email:', err);
            return res.status(500).send('Error deleting email');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Email not found');
        }

        res.send('Email deleted successfully');
    });
};

// Function to get all emails for a user
const getEmails = (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).send('userId is required');
    }

    const sql = 'SELECT * FROM emails WHERE user_id = ?';
    const params = [userId];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching emails:', err);
            return res.status(500).send('Error fetching emails');
        }

        res.json(results);
    });
};

module.exports = {
    addEmail,
    updateEmail,
    getEmails,
    deleteEmail
};