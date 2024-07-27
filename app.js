const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const businessRoutes = require('./routes/businessRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const homeRoutes = require('./routes/homeRoutes');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/home', homeRoutes);
app.use(express.static(path.join(__dirname, 'views')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/redirect-to-task', (req, res) => {
    const { taskId } = req.query; // Extract taskId from query parameters

    // Redirect to do-task.html with taskId as query parameter
    res.redirect(`/do-task.html?taskId=${taskId}`);
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});
app.get('/business_form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'business_form.html'));
});
app.get('/employee_form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'employee_form.html'));
});
app.get('/business_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'business_dashboard.html'));
});
app.get('/business_task', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'business_task.html'));
});
app.get('/employee_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'employee_dashboard.html'));
});
app.get('/employee_task', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'employee_task.html'));
});
app.get('/business_edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'business_edit.html'));
});
app.get('/employee_edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'employee_edit.html'));
});

app.use((req, res, next) => {
    res.status(404).send('Sorry, that route does not exist.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
