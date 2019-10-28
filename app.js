const express = require('express');
const app = express();

app.get('/test', function(req, res) {
    res.send("This is a test");
});

module.exports = app;