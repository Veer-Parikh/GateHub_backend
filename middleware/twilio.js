const otpGenerator = require('otp-generator');
const twilio = require('twilio');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const prisma = new PrismaClient();

const client = twilio(accountSid, authToken);

const sendOtp = async (phoneNumber, otp) => {
    await client.messages.create({
        body: `Your OTP code is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
    });
};

const requestOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    try {
        // Store hashed OTP and timestamp in the database
        await prisma.otpCode.upsert({
            where: { phoneNumber },
            update: {
                otpHash: hashedOtp,
                createdAt: new Date(),
            },
            create: {
                phoneNumber,
                otpHash: hashedOtp,
                createdAt: new Date(),
            },
        });

        await sendOtp(phoneNumber, otp);
        res.send('OTP sent');
    } catch (error) {
        res.status(500).send('Error storing OTP');
    }
};

const verifyOtp = async (phoneNumber, otp) => {
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    try {
        const otpRecord = await prisma.otpCode.findUnique({
            where: { phoneNumber },
        });

        if (!otpRecord) {
            return false;
        }

        const currentTime = new Date();
        const otpAge = (currentTime - otpRecord.createdAt) / 1000; // Age in seconds

        if (otpRecord.otpHash === hashedOtp && otpAge <= 300) { // OTP is valid for 5 minutes
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
};

module.exports = { sendOtp, requestOtp, verifyOtp };
