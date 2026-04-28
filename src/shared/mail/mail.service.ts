import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private config: ConfigService) {
    sgMail.setApiKey(this.config.get<string>('SENDGRID_API_KEY')!);
  }

  public sendVerifyEmail(email: string, link: string) {
    const msg = {
      to: email,
      from: this.config.get<string>('SENDGRID_FROM_EMAIL')!,
      templateId: this.config.get<string>('SENDGRID_VERIFY_TEMPLATE_ID')!,
      dynamicTemplateData: {
        link,
      },
    };

    return sgMail.send(msg);
  }
}
