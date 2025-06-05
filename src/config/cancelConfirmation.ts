import nodemailer from 'nodemailer';

const SendBookingCancellation = async (
  email: string[]=[''],
  userNames: string[]=[''],
  bookingId: string,
  eventName: string,
  date: string,
  seatNumbers: number,
  amount: number
) => {
  try {
    const htmlContent = email.map((_, index) => {
      return `
        <p>Hi ${userNames[index]},</p>
        <p>We're sorry to hear you've canceled your booking.</p>

        <h3>Cancelled Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${bookingId}</li>
          <li><strong>Event Name:</strong> ${eventName}</li>
          <li><strong>Date & Time:</strong> ${date}</li>
          <li><strong>Seat Number(s):</strong> ${seatNumbers}</li>
          <li><strong>Refund Amount:</strong> ₹${amount}</li>
        </ul>

        <p>The amount has been refunded to your wallet.</p>

        <p>Thanks,<br>Your Booking Team</p>
      `;
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'nourinvn@gmail.com',
        pass: process.env.EMAIL_PASS || 'buap yddq bnue hdcz',
      },
    });

    for (let i = 0; i < email.length; i++) {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'nourinvn@gmail.com',
        to: email[i],
        subject: `❌ Booking Cancellation Confirmation for ${eventName}`,
        html: htmlContent[i],
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`Cancellation email sent to ${email[i]}:`, info.response);
    }

  } catch (error) {
    console.error('Error sending cancellation email:', error);
  }
};

export default SendBookingCancellation;
