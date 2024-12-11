const UserRole = {
    Admin: "admin",
    Client: "client"
};

const TicketStatus = {
    Active: 'active',
    Resolved: 'resolved',
    InProgress: 'in-progress',
    Pending: 'pending'
};

const IssueType = {
    BugReport: 'Bug Report',
    FeatureRequest: 'Feature Request',
    UserInquiry: 'User Inquiry',
    SystemOutage: 'System Outage',
    PerformanceIssue: 'Performance Issue',
    SecurityIncident: 'Security Incident',
    DataDiscrepancy: 'Data Discrepancy',
    AccessRequest: 'Access Request',
    ComplianceCheck: 'Compliance Check',
    HardwareFailure: 'Hardware Failure',
    SoftwareUpdate: 'Software Update',
    ConfigurationChange: 'Configuration Change',
    MaintenanceTask: 'Maintenance Task'
};

const IssuePriority = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High'
};

const IssueUrgency = {
    Critical: 'Critical',
    High: 'High',
    Moderate: 'Moderate',
    Low: 'Low',
    Scheduled: 'Scheduled',
    Routine: 'Routine'
};

const ChartTrend = {
    Monthly: 'monthly',
    Weekly: 'weekly',
};

module.exports = {
    UserRole,
    TicketStatus,
    IssueType,
    IssuePriority,
    IssueUrgency,
    ChartTrend
};
