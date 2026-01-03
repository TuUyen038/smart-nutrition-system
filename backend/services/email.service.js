const nodemailer = require("nodemailer");

// Tạo transporter (có thể cấu hình qua .env)
const createTransporter = () => {
  // Nếu có cấu hình SMTP trong .env, sử dụng nó
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Nếu không có cấu hình, sử dụng console log (development mode)
  return {
    sendMail: async (options) => {
      console.log("📧 Email (Development Mode - không gửi thật):");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("Text:", options.text);
      console.log("HTML:", options.html);
      return { messageId: "dev-mode" };
    },
  };
};

const transporter = createTransporter();

/**
 * Gửi OTP qua email
 * @param {String} email - Email người nhận
 * @param {String} otp - Mã OTP (6 chữ số)
 * @param {String} name - Tên người dùng
 */
exports.sendVerificationOTP = async (email, otp, name = "Người dùng") => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "NutriCare <noreply@nutricare.com>",
      to: email,
      subject: "Xác thực email - NutriCare",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NutriCare</h1>
              <p>Xác thực Email</p>
            </div>
            <div class="content">
              <p>Xin chào <strong>${name}</strong>,</p>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại NutriCare!</p>
              <p>Vui lòng sử dụng mã OTP sau để xác thực email của bạn:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666;">Mã OTP của bạn:</p>
                <div class="otp-code">${otp}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Lưu ý:</strong> Mã OTP này có hiệu lực trong <strong>10 phút</strong>. 
                Vui lòng không chia sẻ mã này với bất kỳ ai.
              </div>

              <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
              <p>Trân trọng,<br><strong>Đội ngũ NutriCare</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; ${new Date().getFullYear()} NutriCare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Xin chào ${name},
        
        Cảm ơn bạn đã đăng ký tài khoản tại NutriCare!
        
        Mã OTP xác thực email của bạn là: ${otp}
        
        Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.
        
        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        
        Trân trọng,
        Đội ngũ NutriCare
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email OTP đã được gửi đến:", email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Lỗi khi gửi email OTP:", error);
    throw new Error("Không thể gửi email xác thực. Vui lòng thử lại sau.");
  }
};

/**
 * Gửi OTP reset password qua email
 * @param {String} email - Email người nhận
 * @param {String} otp - Mã OTP (6 chữ số)
 * @param {String} name - Tên người dùng
 */
exports.sendResetPasswordOTP = async (email, otp, name = "Người dùng") => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "NutriCare <noreply@nutricare.com>",
      to: email,
      subject: "Đặt lại mật khẩu - NutriCare",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #f5576c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #f5576c; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .security { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>NutriCare</h1>
              <p>Đặt lại Mật khẩu</p>
            </div>
            <div class="content">
              <p>Xin chào <strong>${name}</strong>,</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              <p>Vui lòng sử dụng mã OTP sau để xác thực và đặt lại mật khẩu:</p>
              
              <div class="otp-box">
                <p style="margin: 0 0 10px 0; color: #666;">Mã OTP của bạn:</p>
                <div class="otp-code">${otp}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Lưu ý:</strong> Mã OTP này có hiệu lực trong <strong>10 phút</strong>. 
                Vui lòng không chia sẻ mã này với bất kỳ ai.
              </div>

              <div class="security">
                <strong>🔒 Bảo mật:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                Mật khẩu của bạn sẽ không thay đổi.
              </div>

              <p>Trân trọng,<br><strong>Đội ngũ NutriCare</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; ${new Date().getFullYear()} NutriCare. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Xin chào ${name},
        
        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
        
        Mã OTP đặt lại mật khẩu của bạn là: ${otp}
        
        Mã này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.
        
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        
        Trân trọng,
        Đội ngũ NutriCare
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email OTP reset password đã được gửi đến:", email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Lỗi khi gửi email OTP reset password:", error);
    throw new Error("Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.");
  }
};

/**
 * Gửi email thông báo xác thực thành công
 */
exports.sendVerificationSuccess = async (email, name = "Người dùng") => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || "NutriCare <noreply@nutricare.com>",
      to: email,
      subject: "Email đã được xác thực - NutriCare",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Xác thực thành công!</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <p>Xin chào <strong>${name}</strong>,</p>
              <p>Email của bạn đã được xác thực thành công!</p>
              <p>Bây giờ bạn có thể sử dụng đầy đủ các tính năng của NutriCare.</p>
              <p>Trân trọng,<br><strong>Đội ngũ NutriCare</strong></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email xác nhận đã được gửi đến:", email);
  } catch (error) {
    console.error("❌ Lỗi khi gửi email xác nhận:", error);
    // Không throw error vì đây chỉ là thông báo
  }
};

