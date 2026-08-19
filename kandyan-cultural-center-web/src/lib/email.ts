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

// 1. Workshop Booking Confirmation (Now includes Price)
export const sendWorkshopEmail = async (email: string, name: string, title: string, date: string, time: string, guests: number, ref: string, amountPaid: number) => {
  const content = `
    <p>Dear ${name},</p>
    <p>We are thrilled to confirm your reservation for <strong>${title}</strong>.</p>
    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
      <table style="width: 100%; font-size: 15px;">
        <tr><td style="padding-bottom: 8px; color: #64748b;">Date:</td><td style="padding-bottom: 8px; text-align: right; font-weight: bold;">${date}</td></tr>
        <tr><td style="padding-bottom: 8px; color: #64748b;">Time:</td><td style="padding-bottom: 8px; text-align: right; font-weight: bold;">${time}</td></tr>
        <tr><td style="padding-bottom: 8px; color: #64748b;">Guests:</td><td style="padding-bottom: 8px; text-align: right; font-weight: bold;">${guests} Person(s)</td></tr>
        <tr><td style="padding-bottom: 8px; color: #64748b;">Total Paid:</td><td style="padding-bottom: 8px; text-align: right; font-weight: bold; color: #d97706;">LKR ${amountPaid.toLocaleString()}</td></tr>
        <tr><td style="color: #64748b;">Ref Number:</td><td style="text-align: right; font-family: monospace; font-weight: bold;">${ref.slice(0,8).toUpperCase()}</td></tr>
      </table>
    </div>
    <p>Please arrive 10 minutes early to settle in. We look forward to hosting you!</p>
  `;
  return transporter.sendMail({ from: SENDER_EMAIL, to: email, subject: `🎟️ Booking Confirmed: ${title}`, html: wrapEmail('Your Experience is Booked!', content) });
};

// 2. Physical Shop Order Confirmation (Now includes Rich Itemized Receipt)
export const sendOrderEmail = async (email: string, orderId: string, address: string, totalAmount: number, items: any[]) => {
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 0; width: 60px;">
        ${item.artifact_variants?.image_url 
          ? `<img src="${item.artifact_variants.image_url}" alt="Item" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0;" />` 
          : `<div style="width: 50px; height: 50px; background: #f1f5f9; border-radius: 8px; text-align: center; line-height: 50px; font-size: 20px;">📦</div>`
        }
      </td>
      <td style="padding: 12px 10px;">
        <p style="margin: 0; font-weight: bold; color: #0f172a; font-size: 14px;">${item.artifact_variants?.artifacts?.name || 'Authentic Artifact'}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;">Color: ${item.artifact_variants?.color_name || 'Standard'} | Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #0f172a; font-size: 14px;">
        LKR ${(item.selling_price_at_sale * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const content = `
    <p>Thank you for your order! We have successfully received your payment and are preparing your artifacts.</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
      <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Order Summary (#${orderId.slice(0,8).toUpperCase()})</p>
      
      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
      </table>
      
      <div style="margin-top: 15px; padding-top: 15px; text-align: right; font-size: 16px;">
        <strong>Total Paid: <span style="color: #d97706;">LKR ${totalAmount.toLocaleString()}</span></strong>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <p style="margin: 0 0 5px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Shipping Destination</p>
      <p style="margin: 0; font-weight: bold; color: #334155;">${address}</p>
    </div>
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