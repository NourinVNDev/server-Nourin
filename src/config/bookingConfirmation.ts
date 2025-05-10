import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const SendBookingConfirmation = async (
    email: string,
    userName: string,
    bookingId: string,
    eventName: string,
    date: string,
    seatNumbers: number,
    amount: number
) => {
    try {
        // Generate QR code as a buffer (not a base64 string)
        const qrBuffer = await QRCode.toBuffer(`BookingID: ${bookingId}
User: ${userName}
Event: ${eventName}
Date: ${date}
Seats: ${seatNumbers}`);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'nourinvn@gmail.com',
                pass: process.env.EMAIL_PASS || 'buap yddq bnue hdcz',
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER || 'nourinvn@gmail.com',
            to: email,
            subject: `🎟️ Booking Confirmation for ${eventName}`,
            html: `
        <p>Hi ${userName},</p>
        <p>Thank you for booking with us! Your seat has been successfully reserved.</p>

        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Event Name:</strong> ${eventName}</li>
          <li><strong>Date & Time:</strong> ${date}</li>
          <li><strong>Seat Number(s):</strong> ${seatNumbers}</li>
          <li><strong>Total Paid:</strong> ₹${amount}</li>
        </ul>

        <p>Please arrive 15–30 minutes early and show this email or the QR code below at the entrance.</p>

        <img src="cid:qr-code" alt="QR Code" style="width:200px;height:auto;" />

        <p>Thanks,<br>Your Booking Team</p>
      `,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrBuffer,
                    cid: 'qr-code' // same as used in the img src above
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent:', info.response);
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

export default SendBookingConfirmation;