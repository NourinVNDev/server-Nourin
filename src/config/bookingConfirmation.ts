import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

const SendBookingConfirmation = async (
    email: string,
    userName: string,
    bookingId: string,
    eventName: string,
    date: string,
    seatNumbers: number,
    amount: number,
    title: string
) => {
    try {
        console.log("From Email Function",title);

        let qrBuffer: Buffer | null = null;
        let htmlContent = `
        <p>Hi ${userName},</p>
        <p>Thank you for booking with us!</p>

        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Event Name:</strong> ${eventName}</li>
          <li><strong>Date & Time:</strong> ${date}</li>
          <li><strong>Seat Number(s):</strong> ${seatNumbers}</li>
          <li><strong>Total Paid:</strong> ₹${amount}</li>
        </ul>
        `;

        const attachments: any[] = [];

        if (title === 'Virtual') {
            const token = '007eJxTYJh2fX1CbDXHm/ke6xOSfnOsVexbdcx2nt9laVGWRplwV34FBiMLA0MLozSjZEuzVBOTpCRLI+M0IwMTU6NU09SUFFNDrcWqGQ2BjAwv1u1gYWSAQBCfkyE5P68kMTMvtYiBAQBmwR+m';
            const joinLink = `http://localhost:5173/join-stream?channelName=container&token=${encodeURIComponent(token)}&eventName=${eventName}`;

            htmlContent += `
            <p>This is a virtual event. Click the link below to join the stream at the scheduled time:</p>
            <p><a href="${joinLink}" target="_blank" style="color:blue;">Join Live Stream</a></p>
            `;
        } else {
          
            qrBuffer = await QRCode.toBuffer(`BookedID: ${bookingId}
User: ${userName}
Event: ${eventName}
Date: ${date}
Seats: ${seatNumbers}`);

            htmlContent += `
            <p>Please arrive 15–30 minutes early and show this email or the QR code below at the entrance.</p>
            <img src="cid:qr-code" alt="QR Code" style="width:200px;height:auto;" />
            `;

            attachments.push({
                filename: 'qrcode.png',
                content: qrBuffer,
                cid: 'qr-code'
            });
        }

        htmlContent += `
        <p>Thanks,<br>Your Booking Team</p>
        `;

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
            html: htmlContent,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent:', info.response);

    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

export default SendBookingConfirmation;
