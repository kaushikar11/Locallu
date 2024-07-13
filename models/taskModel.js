class Task {
    constructor(id, name, description, price, dueDate, status, isAssigned, assignedTo, businessId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.dueDate = dueDate;
        this.status = status;
        this.isAssigned = isAssigned;
        this.assignedTo = assignedTo;
        this.businessId = businessId;
        this.solution='';
    }
}

module.exports = Task;
