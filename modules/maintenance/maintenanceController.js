const prisma = require('../../utils/prisma');
const logger = require('../../utils/logger');
const cron = require('node-cron');

cron.schedule('30 18 3 * *', async () => {
    try {
        const users = await prisma.user.findMany();

        const maintenancePromises = users.map(user => {
            return prisma.maintenance.create({
                data: {
                    amount: 100.00,  // Set the amount for the maintenance bill
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    year: new Date().getFullYear(),
                    paid: false,
                    userId: user.userId
                }
            });
        });

        await Promise.all(maintenancePromises);
        logger.info('Maintenance bills created for all users');
    } catch (error) {
        logger.error('Failed to create maintenance bills:', error);
    }
});