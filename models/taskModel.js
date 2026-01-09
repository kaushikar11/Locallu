class Task {
    constructor(id, name, description, price, dueDate, status, isAssigned, assignedTo, businessId, solution = '', dateCreated = null) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.dueDate = dueDate;
        this.dateCreated = dateCreated;
        this.status = status; // Status workflow: 'pending' | 'assigned' | 'in_progress' | 'submitted' | 'reviewed' | 'approved' | 'rejected'
        this.isAssigned = isAssigned;
        this.assignedTo = assignedTo;
        this.businessId = businessId;
        this.solution = solution;
        this.reviewComments = null;
        this.reviewedAt = null;
        this.reviewedBy = null;
    }
}

// Task status workflow constants
const TASK_STATUS = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    SUBMITTED: 'submitted',
    REVIEWED: 'reviewed',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

// Valid status transitions
const STATUS_TRANSITIONS = {
    [TASK_STATUS.PENDING]: [TASK_STATUS.ASSIGNED],
    [TASK_STATUS.ASSIGNED]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.PENDING], // Can unassign
    [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.SUBMITTED, TASK_STATUS.ASSIGNED],
    [TASK_STATUS.SUBMITTED]: [TASK_STATUS.REVIEWED],
    [TASK_STATUS.REVIEWED]: [TASK_STATUS.APPROVED, TASK_STATUS.REJECTED, TASK_STATUS.IN_PROGRESS], // Can request changes
    [TASK_STATUS.APPROVED]: [], // Final state
    [TASK_STATUS.REJECTED]: [TASK_STATUS.ASSIGNED, TASK_STATUS.PENDING] // Can reassign
};

function isValidStatusTransition(currentStatus, newStatus) {
    return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) || false;
}

module.exports = { Task, TASK_STATUS, STATUS_TRANSITIONS, isValidStatusTransition };
