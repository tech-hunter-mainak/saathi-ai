// scripts/test-smtp.js

import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// explicitly load .env from project root
dotenv.config({
	path: path.resolve(process.cwd(), '.env')
});

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

console.log('Loaded variables:');
console.log('SMTP_HOST =', SMTP_HOST);
console.log('SMTP_PORT =', SMTP_PORT);
console.log('SMTP_USER =', SMTP_USER);
console.log('SMTP_PASS exists =', !!SMTP_PASS);

if (!SMTP_USER || !SMTP_PASS) {
	console.error('SMTP credentials missing. Check .env file.');
	process.exit(1);
}

const transporter = nodemailer.createTransport({
	host: SMTP_HOST || 'smtp.gmail.com',
	port: Number(SMTP_PORT) || 465,
	secure: true,
	auth: {
		user: SMTP_USER,
		pass: SMTP_PASS
	}
});

async function testSMTP() {
	try {
		console.log('Verifying SMTP connection...');

		await transporter.verify();

		console.log('✅ SMTP connection successful');
	} catch (error) {
		console.error('❌ SMTP verification failed');
		console.error(error);
	}
}

testSMTP();
