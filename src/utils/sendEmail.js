import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1) Create the mail carrier using Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Build the email
  const mailOptions = {
    from: 'Metro App <no-reply@metro.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Fire it off!
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

