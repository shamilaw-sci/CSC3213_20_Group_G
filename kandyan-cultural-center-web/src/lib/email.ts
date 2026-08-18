import nodemailer from 'nodemailer';

// Configure Nodemailer for Resend SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS,
  },
});

const SENDER_EMAIL = `"Kandyan Cultural Centre" <${process.env.NEXT_PUBLIC_SITE_EMAIL || 'hello@kandyanculturalcentre.lk'}>`;

// The Master KCC HTML Wrapper
const wrapEmail = (title: string, content: string) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;">
    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #fcd34d;">
      <h1 style="color: #d97706; margin: 0; font-size: 22px; letter-spacing: 2px; text-transform: uppercase;">Kandyan Cultural Centre</h1>
    </div>
    <div style="padding: 30px 20px; background-color: #ffffff; border-radius: 12px; margin-top: 20px; color: #334155; line-height: 1.6; font-size: 15px;">
      <h2 style="color: #0f172a; margin-top: 0; text-align: center;">${title}</h2>
      ${content}
    </div>
    <div style="text-align: center; padding-top: 20px; margin-top: 20px; color: #94a3b8; font-size: 12px;">
      <p>Kandyan Cultural Centre, Sri Lanka</p>
      <p>© ${new Date().getFullYear()} All Rights Reserved.</p>
    </div>
  </div>
`;

// 1. Workshop Booking Confirmation
export const sendWorkshopEmail = async (email: string, name: string, title: string, date: string, time: string, guests: number, ref: string) => {
  const content = `
    <p>Dear ${name},</p>
    <p>We are thrilled to confirm your reservation for <strong>${title}</strong>.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
      <p style="margin: 5px 0;"><strong>Date:</strong> ${date}</p>
      <p style="margin: 5px 0;"><strong>Time:</strong> ${time}</p>
      <p style="margin: 5px 0;"><strong>Guests:</strong> ${guests}</p>
      <p style="margin: 5px 0;"><strong>Booking Ref:</strong> <span style="font-family: monospace; color: #d97706;">${ref.slice(0,8).toUpperCase()}</span></p>
    </div>
    <p>Please arrive 10 minutes early to settle in. We look forward to hosting you!</p>
  `;
  return transporter.sendMail({ from: SENDER_EMAIL, to: email, subject: `🎟️ Booking Confirmed: ${title}`, html: wrapEmail('Your Experience is Booked!', content) });
};

// 2. Physical Shop Order Confirmation
export const sendOrderEmail = async (email: string, orderId: string, address: string) => {
  const content = `
    <p>Thank you for your order! We have successfully received your payment.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
      <p style="margin: 5px 0;"><strong>Order ID:</strong> <span style="font-family: monospace; color: #d97706;">${orderId.slice(0,8).toUpperCase()}</span></p>
      <p style="margin: 15px 0 5px 0;"><strong>Shipping Destination:</strong></p>
      <p style="margin: 0; font-weight: bold;">${address}</p>
    </div>
    <p>We are carefully preparing your authentic artifacts. You will receive an update once they are handed to our courier.</p>
  `;
  return transporter.sendMail({ from: SENDER_EMAIL, to: email, subject: `📦 Order Confirmed - Kandyan Cultural Centre`, html: wrapEmail('Payment Successful!', content) });
};

// 3. Hall Booking Status Updates
export const sendHallEmail = async (email: string, name: string, date: string, status: 'received' | 'approved' | 'rejected') => {
  let title = '';
  let content = '';

  if (status === 'received') {
    title = 'Request Received';
    content = `<p>Dear ${name},</p><p>We have received your reservation request for the Grand Heritage Hall on <strong>${date}</strong>. Our administration team is reviewing the details and will notify you of the approval status shortly.</p>`;
  } else if (status === 'approved') {
    title = 'Booking Approved!';
    content = `<p>Dear ${name},</p><p>Great news! Your reservation for the Grand Heritage Hall on <strong>${date}</strong> has been officially approved and locked in our calendar.</p><p>Please contact our administrative desk within 48 hours to finalize your arrangements.</p>`;
  } else {
    title = 'Booking Update';
    content = `<p>Dear ${name},</p><p>We regret to inform you that the Grand Heritage Hall is unavailable on <strong>${date}</strong>. Please check our online calendar to submit a request for an alternate date.</p>`;
  }

  return transporter.sendMail({ from: SENDER_EMAIL, to: email, subject: `🏛️ Hall Booking Update: ${date}`, html: wrapEmail(title, content) });
};