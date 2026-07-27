"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    constructor() {
        const yourGmailAddress = 'hazemturki66@gmail.com';
        const your16DigitAppPassword = 'yerx qozc nurs imdp';
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: yourGmailAddress,
                pass: your16DigitAppPassword,
            },
        });
    }
    async sendPasswordResetCode(to, name, code) {
        const mailOptions = {
            from: '"MicroVita" <YOUR_EMAIL@gmail.com>',
            to: to,
            subject: 'Password Reset Code - MicroVita',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0b6e4f;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for your MicroVita account.</p>
          
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your verification code is:</p>
            <h1 style="font-size: 48px; letter-spacing: 5px; color: #0b6e4f; margin: 10px 0;">${code}</h1>
            <p style="font-size: 12px; color: #999;">This code will expire in 10 minutes</p>
          </div>
          
          <p>Enter this code in the app to reset your password.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="font-size: 12px; color: #666;">MicroVita - Grow Small. Live Big.</p>
        </div>
      `,
        };
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
        }
        catch (error) {
            console.error('Failed to send email:', error);
            throw new Error('Failed to send reset code');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map