// models/employerModel.js

class Employer {
    constructor(uid, displayName, email) {
        this.uid = uid;
        this.displayName = displayName;
        this.email = email;
    }
}

module.exports = Employer;
