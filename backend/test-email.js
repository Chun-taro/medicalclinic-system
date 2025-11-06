const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'michaelangeloangeles0@gmail.com',
    pass: 'lzwg hzev hkgo lver'
  }
});

transporter.sendMail({
  to: 'chuntaro0430@gmail.com',
  subject: 'Test Email from Nodemailer',
  html: '<p>This is a test email sent from your Node.js backend using Nodemailer.</p>'
}, (err, info) => {
  if (err) {
    return console.error(' Email failed:', err);
  }
  console.log(' Email sent:', info.response);
});