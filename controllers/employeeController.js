const { db, bucket } = require('../config/firebase');
const Employee = require('../models/employeeModel');

// Add a new employee
exports.addEmployee = async (req, res) => {
    try {
        console.log('Attempting to add a new employee...');
        const employeeData = req.body;
        const employee = new Employee(employeeData);
        const docRef = await db.collection('employees').add({ ...employee });
        console.log('Employee added successfully with ID:', docRef.id);

        const userId = employeeData.uid;
        const userRef = db.collection('users').doc(userId);
        await userRef.set({ employeeId: docRef.id }, { merge: true });

        res.status(201).json({ id: docRef.id, ...employee });
    } catch (error) {
        console.error('Error adding employee:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Upload employee image
exports.uploadImage = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const blob = bucket.file(`employees/${employeeId}/profilePicture/profilePicture.jpg`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading image:', err);
            res.status(500).send('Error uploading image.');
        });

        blobStream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            res.status(200).json({ imageUrl: publicUrl });
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error uploading employee image:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get employee details by ID
exports.getEmployeeDetailsByID = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const employeeDoc = await db.collection('employees').doc(employeeId).get();
        if (!employeeDoc.exists) {
            return res.status(404).send('Employee not found');
        }

        const employeeData = employeeDoc.data();
        res.json(employeeData);
    } catch (error) {
        console.error('Error fetching employee details:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Get employee profile picture
exports.getProfilePicture = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const file = bucket.file(`employees/${employeeId}/profilePicture/profilePicture.jpg`);
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491' // Adjust expiration date as needed
        });
        console.log(`Profile picture URL: ${url}`);
        res.json({ profilePictureUrl: url });
    } catch (error) {
        console.error('Error fetching profile picture:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.checkEmailExistsinEmp = async (req, res) => {
    const { email } = req.params;
    
    try {
        const businessesRef = db.collection('employees');
        const snapshot = await businessesRef.where('email', '==', email).get();

        if (snapshot.empty) {
            return res.json({ exists: false });
        } else {
            return res.json({ exists: true });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).send('Internal Server Error');
    }
};
