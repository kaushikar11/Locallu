const { db, bucket } = require('../config/firebase');

class Employee {
    constructor(data) {
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.skills = data.skills;
        this.paymentInfo = data.paymentInfo;
        this.purpose = data.purpose;
        this.location = data.location;
        this.contactInfo = data.contactInfo;
        this.githubLink = data.githubLink;
        this.previousJobs = data.previousJobs; // Added field
        this.qualifications = data.qualifications; // Added field
        this.aboutEmployee = data.aboutEmployee; // Added field
        this.uid = data.uid;
        this.email = data.email;
        this.displayName = data.displayName;
        this.photoURL = data.photoURL;
    }
}

module.exports = Employee;
