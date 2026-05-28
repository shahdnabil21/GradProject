const generateMessage = (value) => ({
    alreadyExists: `${value} already exists`,
    notFound:      `${value} not found`,
    created:       `${value} is created successfully`,
    updated:       `${value} is updated successfully`,
    deleted:       `${value} is deleted successfully`,
    failToCreate:  `fail to create ${value}`,
    failToUpdate:  `fail to update ${value}`,
    failToDelete:  `fail to delete ${value}`,
});

export const MESSAGES = {
    user:      generateMessage("User"),
    ticket:    generateMessage("Ticket"),
    analytics: generateMessage("Analytics"),
    subscription: generateMessage("Subscription"),
    wallet:       generateMessage("Wallet"),
    dashboard: {
        accessDenied:      "Access denied. Admins only.",
        invalidAdminEmail: "Access denied. Admin email must be in format: user@admin.eg.com",
        invalidPeriod:     "Period must be one of: today, week, month, year",
        invalidLimit:      "Limit must be a number between 1 and 50",
        fetched:           "Dashboard data fetched successfully",
    },
};