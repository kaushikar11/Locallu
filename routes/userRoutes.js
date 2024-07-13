const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { getUserInfoFromEmail, getBusinessIDByUserID,getEmployeeIDByUserID } = require('../controllers/userController');

const JWT_SECRET = process.env.JWT_SECRET;

router.get('/getUserId', async (req, res) => {
    try {
        const email = req.query.email; // Extract email from query parameters
        const userInfo = await getUserInfoFromEmail(email); // Call function to get user information
        if (userInfo) {
            const { uid, email, displayName, photoURL } = userInfo;
            const token = jwt.sign({ uid, email, displayName, photoURL }, JWT_SECRET, { expiresIn: '1h' }); // Generate JWT token
            res.status(200).json({ token }); // Send response with JWT token
        } else {
            res.status(404).json({ error: 'User not found' }); // Handle case where user information is not found
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' }); // Handle any internal errors
    }
});

router.get('/getUpdatedToken', async (req,res) => {
    try{
        const taskID = req.query.taskID;
        const token = req.query.token;
        const po = req.query.po;
        if(token && taskID){
            const newPayload = { token, taskID };
            const updatedToken = jwt.sign(newPayload, JWT_SECRET, {expiresIn: '1h'});
            res.status(200).json({ updatedToken });
        } else{
            res.status(404).json({error : 'token or taskID cannot be found'});
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

router.get('/:uid', getBusinessIDByUserID);
router.get('/emp/:uid', getEmployeeIDByUserID);

module.exports = router;
