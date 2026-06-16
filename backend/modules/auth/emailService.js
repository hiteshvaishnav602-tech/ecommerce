import nodemailer from 'nodemailer';

const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000, // 5 seconds
    socketTimeout: 5000,     // 5 seconds
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransport();
    
    // Create a plain text fallback version from HTML content for spam filters
    const text = html
      .replace(/<style([\s\S]*?)<\/style>/gi, '') // Remove CSS
      .replace(/<[^>]*>/g, ' ')                  // Strip HTML tags
      .replace(/\s+/g, ' ')                     // Normalize spacing
      .trim();

    const info = await transporter.sendMail({
      from: `"Aura Store" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
    });
    console.log(`✉️ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    throw error;
  }
};


export const sendWelcomeEmail = async (email, userName) => {
  try {
    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#1e293b;padding:40px 30px;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align:center;margin-bottom:35px;">
          <h1 style="color:#0f172a;font-size:32px;font-weight:800;margin:0;letter-spacing:2px;">AURA</h1>
          <p style="color:#64748b;font-size:13px;margin:5px 0;text-transform:uppercase;letter-spacing:1.5px;">Premium Fashion Store</p>
        </div>
        <div style="border-top:4px solid #0f172a;padding-top:30px;">
          <h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:15px;margin-top:0;">Welcome to Aura, ${userName}! 🎉</h2>
          <p style="color:#475569;line-height:1.7;font-size:15px;">
            We are absolutely thrilled to welcome you to our fashion community! Aura is designed to bring out your unique presence with our premium curation of trends and high-streetwear collections.
          </p>
          <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:30px 0;border:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0 0 10px 0;font-size:13px;color:#64748b;text-transform:uppercase;font-weight:600;letter-spacing:1px;">Your Welcoming Gift</p>
            <div style="font-size:30px;font-weight:800;color:#0f172a;margin-bottom:5px;">10% OFF</div>
            <p style="margin:0 0 15px 0;font-size:14px;color:#475569;">On your very first order with code:</p>
            <span style="background:#0f172a;color:#ffffff;padding:10px 24px;border-radius:6px;font-family:monospace;font-size:18px;font-weight:bold;letter-spacing:2px;display:inline-block;">WELCOME10</span>
          </div>
          <div style="text-align:center;margin:35px 0 25px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://aurafashion.com'}" style="background:#0f172a;color:#ffffff;padding:16px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.5px;display:inline-block;box-shadow:0 4px 6px rgba(15,23,42,0.15);">
              Explore Collections
            </a>
          </div>
        </div>
        <div style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:25px;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
          If you have any questions, feel free to reply directly to this email. We're here to help!<br><br>
          <strong>Aura Store Inc.</strong><br>
          123 Fashion Design District, Mumbai, MH, India<br>
          <span style="font-size:11px;color:#cbd5e1;">You received this because you registered an account on our store.</span>
        </div>
      </div>
    `;
    await sendEmail({ to: email, subject: 'Welcome to Aura! 🎉', html });
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
  }
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#1e293b;padding:40px 30px;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align:center;margin-bottom:35px;">
          <h1 style="color:#0f172a;font-size:32px;font-weight:800;margin:0;letter-spacing:2px;">AURA</h1>
          <p style="color:#64748b;font-size:13px;margin:5px 0;text-transform:uppercase;letter-spacing:1.5px;">Premium Fashion Store</p>
        </div>
        <div style="border-top:4px solid #0f172a;padding-top:30px;">
          <h2 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:15px;margin-top:0;">Reset Your Password</h2>
          <p style="color:#475569;line-height:1.7;font-size:15px;">
            We received a request to reset your password. Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.
          </p>
          <div style="text-align:center;margin:35px 0 25px 0;">
            <a href="${resetUrl}" style="background:#0f172a;color:#ffffff;padding:16px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.5px;display:inline-block;box-shadow:0 4px 6px rgba(15,23,42,0.15);">
              Reset Password
            </a>
          </div>
          <p style="color:#64748b;font-size:13px;line-height:1.5;text-align:center;margin-top:25px;">
            If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:25px;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
          <strong>Aura Store Inc.</strong><br>
          123 Fashion Design District, Mumbai, MH, India
        </div>
      </div>
    `;
    await sendEmail({ to: email, subject: 'Password Reset Request - Aura', html });
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    throw error; // Re-throw for forgotPassword route which handles it
  }
};

export const sendOrderConfirmationEmail = async (email, userName, order) => {
  try {
    const itemsList = order.items
      .map(
        (item) => `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 10px;color:#0f172a;font-weight:500;">${item.title}</td>
          <td style="padding:12px 10px;text-align:center;color:#475569;">${item.quantity}</td>
          <td style="padding:12px 10px;text-align:right;color:#0f172a;font-weight:600;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const paymentMethodLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)';
    const paymentStatusLabel = order.paymentStatus === 'paid' ? 'Paid Successfully' : 'Pending Payment (Pay on Delivery)';
    const statusColor = order.paymentStatus === 'paid' ? '#10b981' : '#facc15';

    const html = `
      <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#1e293b;padding:40px 30px;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align:center;margin-bottom:35px;">
          <h1 style="color:#0f172a;font-size:32px;font-weight:800;margin:0;letter-spacing:2px;">AURA</h1>
          <p style="color:#64748b;font-size:13px;margin:5px 0;text-transform:uppercase;letter-spacing:1.5px;">Premium Fashion Store</p>
        </div>
        <div style="border-top:4px solid #10b981;padding-top:30px;">
          <div style="text-align:center;margin-bottom:25px;">
            <span style="font-size:50px;">✅</span>
            <h2 style="font-size:26px;font-weight:800;color:#0f172a;margin:10px 0 5px 0;">Order Confirmed!</h2>
            <p style="color:#64748b;margin:0;font-size:15px;">Order Number: <strong style="color:#0f172a;">${order.orderNumber}</strong></p>
          </div>

          <p style="color:#0f172a;font-size:16px;font-weight:600;margin:20px 0 10px 0;">Hello ${userName},</p>
          <p style="color:#475569;line-height:1.6;font-size:15px;margin:0 0 20px 0;">
            Thank you for your order! We are preparation-ready and will notify you as soon as your premium streetwear items are shipped.
          </p>

          <!-- Payment & Shipping Summary -->
          <div style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;padding:20px;margin-bottom:25px;">
            <h3 style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin:0 0 12px 0;letter-spacing:1px;">Payment & Delivery</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr>
                <td style="padding:5px 0;color:#64748b;">Method</td>
                <td style="padding:5px 0;font-weight:600;color:#0f172a;text-align:right;">${paymentMethodLabel}</td>
              </tr>
              <tr>
                <td style="padding:5px 0;color:#64748b;">Status</td>
                <td style="padding:5px 0;font-weight:700;color:${statusColor};text-align:right;">${paymentStatusLabel}</td>
              </tr>
            </table>
          </div>

          <!-- Items List -->
          <h3 style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin:0 0 10px 0;letter-spacing:1px;">Items Ordered</h3>
          <table style="width:100%;border-collapse:collapse;margin-bottom:25px;font-size:14px;">
            <thead>
              <tr style="border-bottom:2px solid #e2e8f0;">
                <th style="padding:12px 10px;text-align:left;color:#64748b;font-weight:600;">Product</th>
                <th style="padding:12px 10px;text-align:center;color:#64748b;font-weight:600;width:60px;">Qty</th>
                <th style="padding:12px 10px;text-align:right;color:#64748b;font-weight:600;width:100px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
          </table>

          <!-- Order Total -->
          <div style="border-top:2px solid #e2e8f0;padding-top:15px;margin-bottom:30px;text-align:right;">
            <span style="font-size:14px;color:#64748b;font-weight:600;margin-right:10px;">Amount Paid:</span>
            <span style="font-size:22px;font-weight:800;color:#0f172a;">₹${order.totalAmount.toFixed(2)}</span>
          </div>

          <p style="color:#64748b;font-size:14px;text-align:center;line-height:1.6;margin-bottom:10px;">
            Thank you for shopping with us! We will send you another email as soon as your items ship with tracking details.
          </p>
        </div>
        <div style="margin-top:40px;border-top:1px solid #e2e8f0;padding-top:25px;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
          <strong>Aura Store Inc.</strong><br>
          123 Fashion Design District, Mumbai, MH, India
        </div>
      </div>
    `;
    await sendEmail({
      to: email,
      subject: `Order Confirmed - ${order.orderNumber} | Aura`,
      html,
    });
  } catch (error) {
    console.error('❌ Order confirmation email failed:', error.message);
  }
};
