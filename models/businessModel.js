// models/businessModel.js

const { db,bucket } = require('../config/firebase');

class Business {
    constructor(data) {
        this.businessName = data.businessName;
        this.paymentInfo = data.paymentInfo;
        this.productPurpose = data.productPurpose;
        this.industry = data.industry;
        this.location = data.location;
        this.contactInfo = data.contactInfo;
        this.websiteURL = data.websiteURL;
        this.companyDescription = data.companyDescription;
        this.uid = data.uid;
        this.email = data.email;
        this.displayName = data.displayName;
        this.photoURL = data.photoURL;
    }
}

module.exports = Business;
