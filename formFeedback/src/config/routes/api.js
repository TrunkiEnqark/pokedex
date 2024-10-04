
// Route to handle form submission
app.post('/feedback', (req, res) => {
    const { firstname, lastname, email, feedback } = req.body;

    const sql = 'INSERT INTO feedback (firstname, lastname, email, feedback) VALUES (?, ?, ?, ?)';
    db.query(sql, [firstname, lastname, email, feedback], (err, result) => {
        if (err) throw err;
        res.send('Data inserted: ' + result.insertId);
    });
});

