const { db } = require('../config/firebase');
const Employer = require('../models/employerModel');

// Add a new employer
exports.addEmployer = async (req, res) => {
    try {
        console.log('Attempting to add a new employer...');
        const { uid, displayName, email } = req.body;
        const employer = new Employer(uid, displayName, email);
        const docRef = await db.collection('employers').add({ ...employer, uid });
        res.status(201).json({ id: docRef.id, ...employer });
    } catch (error) {
        console.error('Error adding employer:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get all employers
exports.getAllEmployers = async (req, res) => {
    try {
        console.log('Attempting to get all employers...');
        const snapshot = await db.collection('employers').get();
        if (snapshot.empty) {
            console.log('No employers found.');
            return res.status(200).send([]);
        }
        let employers = [];
        snapshot.forEach(doc => {
            employers.push({ id: doc.id, ...doc.data() });
        });
        console.log('Employers retrieved successfully:', employers);
        res.status(200).json(employers);
    } catch (error) {
        console.error('Error getting employers:', error);
        res.status(500).send('Internal Server Error');
    }
};
// Get an employer by ID
exports.getEmployerById = async (req, res) => {
    try {
        console.log(`Attempting to get employer with ID: ${req.params.id}`);
        const doc = await db.collection('employers').doc(req.params.id).get();
        if (!doc.exists) {
            console.log('Employer not found.');
            return res.status(404).send('Employer not found');
        }
        console.log('Employer retrieved successfully:', { id: doc.id, ...doc.data() });
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`Error getting employer with ID ${req.params.id}:`, error);
        res.status(500).send('Internal Server Error');
    }
};

// Delete an employer
exports.deleteEmployer = async (req, res) => {
    try {
        console.log(`Attempting to delete employer with ID: ${req.params.id}`);
        await db.collection('employers').doc(req.params.id).delete();
        console.log('Employer deleted successfully.');
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting employer with ID ${req.params.id}:`, error);
        res.status(500).send('Internal Server Error');
    }
};

