const { db, bucket } = require('../config/firebase');
const Business = require('../models/businessModel');

// Add a new business
exports.addBusiness = async (req, res) => {
    try {
        console.log('Attempting to add a new business...');
        const businessData = req.body;
        const business = new Business(businessData);
        const docRef = await db.collection('businesses').add({ ...business });
        console.log('Business added successfully with ID:', docRef.id);

        const userId = businessData.uid;
        const userRef = db.collection('users').doc(userId);
        await userRef.set({ businessId: docRef.id }, { merge: true });

        res.status(201).json({ id: docRef.id, ...business });
    } catch (error) {
        console.error('Error adding business:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Upload business image
exports.uploadImage = async (req, res) => {
    try {
        const { businessId } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        const blob = bucket.file(`businesses/${businessId}/profilePicture/profilePicture.jpg`);
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
        console.error('Error uploading business image:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getBusinessDetailsByID = async(req, res) => {
    const { businessId } = req.params;

    try {
        const businessDoc = await db.collection('businesses').doc(businessId).get();
        if (!businessDoc.exists) {
            return res.status(404).send('Business not found');
        }

        const businessData = businessDoc.data();
        res.json(businessData);
    } catch (error) {
        console.error('Error fetching business details:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.getProfilePicture = async (req, res) => {
    const { businessId } = req.params;
    
    try {
        const file = bucket.file(`businesses/${businessId}/profilePicture/profilePicture.jpg`);
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
  
exports.checkEmailExists = async (req, res) => {
    const { email } = req.params;
    
    try {
        const businessesRef = db.collection('businesses');
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

// Update a specific business detail
exports.updateBusinessDetail = async (req, res) => {
    const businessId = req.params.id;
    const { key, value } = req.body;

    try {
        const businessRef = db.collection('businesses').doc(businessId);
        const businessDoc = await businessRef.get();

        if (!businessDoc.exists) {
            return res.status(404).json({ error: 'Business not found' });
        }

        // Update the specific detail
        await businessRef.update({
            [key]: value
        });

        const updatedBusinessDoc = await businessRef.get();
        res.json({ message: 'Business detail updated successfully', business: updatedBusinessDoc.data() });
    } catch (error) {
        console.error('Error updating business detail:', error);
        res.status(500).json({ error: 'An error occurred while updating the business detail' });
    }
};

exports.updateProfilePicture = async (req, res) => {
    try {
        const businessId = req.params.id;
        const file = req.file;

        if (!file) {
            return res.status(400).send('No file uploaded.');
        }

        // Define the storage path
        const blob = bucket.file(`businesses/${businessId}/profilePicture/profilePicture.jpg`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Error uploading image:', err);
            res.status(500).send('Error uploading image.');
        });

        blobStream.on('finish', async () => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            // Update the business profile picture URL in the Firestore
            const businessRef = db.collection('businesses').doc(businessId);
            await businessRef.update({
                photoURL: publicUrl
            });

            res.status(200).json({ message: 'Profile picture updated successfully', imageUrl: publicUrl });
        });

        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).send('Internal Server Error');
    }
};

