import { Resend } from 'resend';
import type { Appointment, Service } from '@shared/schema';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getApiKey() {
  const credentials = await getCredentials();
  return credentials.apiKey;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableResendClient() {
  const apiKey = await getApiKey();
  return {
    client: new Resend(apiKey),
    fromEmail: connectionSettings.settings.from_email
  };
}

// Email templates
function createBookingConfirmationEmail(
  appointment: Appointment,
  service: Service
): { subject: string; html: string } {
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const depositAmount = appointment.depositAmount || '0.00';
  const totalPrice = service.price;

  const subject = `Booking Confirmation - ${service.name} at CharisLooks`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      font-size: 16px;
      color: #d4af37;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #1a1a1a;
      margin-bottom: 20px;
    }
    .appointment-details {
      background-color: #f9f9f9;
      border-left: 4px solid #d4af37;
      padding: 20px;
      margin: 25px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #1a1a1a;
    }
    .detail-value {
      color: #4a4a4a;
      text-align: right;
    }
    .deposit-section {
      background-color: #fff8e7;
      border: 2px solid #d4af37;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
    }
    .deposit-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 15px 0;
      text-align: center;
    }
    .deposit-amount {
      font-size: 36px;
      font-weight: 700;
      color: #d4af37;
      text-align: center;
      margin: 15px 0;
    }
    .payment-instructions {
      background-color: #ffffff;
      border-radius: 6px;
      padding: 20px;
      margin-top: 20px;
    }
    .payment-instructions h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 15px 0;
    }
    .payment-instructions ol {
      margin: 0;
      padding-left: 20px;
    }
    .payment-instructions li {
      margin-bottom: 10px;
      color: #4a4a4a;
    }
    .note-box {
      background-color: #f0f7ff;
      border-left: 4px solid #2563eb;
      padding: 15px 20px;
      margin: 25px 0;
    }
    .note-box p {
      margin: 0;
      color: #1e40af;
      font-size: 14px;
    }
    .footer {
      background-color: #1a1a1a;
      color: #ffffff;
      text-align: center;
      padding: 30px;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
    .footer a {
      color: #d4af37;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CharisLooks</h1>
      <p>BEAUTY & ARTISTRY</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${appointment.clientName},</p>
      
      <p>Thank you for booking with CharisLooks! We're excited to help you look and feel your absolute best.</p>
      
      <div class="appointment-details">
        <div class="detail-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${service.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${formattedTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${service.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Price:</span>
          <span class="detail-value">$${totalPrice}</span>
        </div>
      </div>
      
      <div class="deposit-section">
        <h2 class="deposit-title">📧 Deposit Payment Required</h2>
        <div class="deposit-amount">$${depositAmount}</div>
        <p style="text-align: center; color: #4a4a4a; margin: 10px 0;">20% deposit to confirm your booking</p>
        
        <div class="payment-instructions">
          <h3>How to Send Your Deposit via Interac e-Transfer:</h3>
          <ol>
            <li>Log in to your online or mobile banking</li>
            <li>Select "Interac e-Transfer" or "Send Money"</li>
            <li>Send <strong>$${depositAmount}</strong> to: <strong>charislooks@email.com</strong></li>
            <li>In the message field, include your name and appointment date</li>
            <li>Complete the transfer</li>
          </ol>
        </div>
      </div>
      
      <div class="note-box">
        <p><strong>⏰ Important:</strong> Please send your deposit payment before your appointment date to secure your booking. The remaining balance of $${(parseFloat(totalPrice) - parseFloat(depositAmount as string)).toFixed(2)} will be due on the day of your appointment.</p>
      </div>
      
      ${appointment.notes ? `
      <div style="margin: 25px 0;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #1a1a1a;">Your Notes:</p>
        <p style="margin: 0; color: #4a4a4a; font-style: italic;">${appointment.notes}</p>
      </div>
      ` : ''}
      
      <p style="margin-top: 30px;">If you have any questions or need to reschedule, please don't hesitate to contact us.</p>
      
      <p style="margin-top: 20px;">Looking forward to seeing you!</p>
      <p style="margin: 5px 0 0 0;"><strong>The CharisLooks Team</strong></p>
    </div>
    
    <div class="footer">
      <p><strong>CharisLooks Beauty & Makeup Artistry</strong></p>
      <p>Email: charislooks@email.com | Phone: (555) 123-4567</p>
      <p style="margin-top: 15px; font-size: 12px; color: #999;">
        This is an automated confirmation email. Please do not reply directly to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// Send booking confirmation email
export async function sendBookingConfirmationEmail(
  appointment: Appointment,
  service: Service
): Promise<void> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const { subject, html } = createBookingConfirmationEmail(appointment, service);

    await client.emails.send({
      from: fromEmail,
      to: appointment.clientEmail,
      subject,
      html,
    });

    console.log(`✅ Booking confirmation email sent to ${appointment.clientEmail}`);
  } catch (error) {
    console.error('❌ Failed to send booking confirmation email:', error);
    throw error;
  }
}
