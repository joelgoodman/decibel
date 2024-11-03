import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { EmailProvider, EmailOptions } from '../types'

export class SESEmailProvider implements EmailProvider {
  private client: SESClient

  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const command = new SendEmailCommand({
      Source: process.env.EMAIL_FROM!,
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
        },
        Body: {
          Html: {
            Data: options.html,
          },
          Text: {
            Data: options.text,
          },
        },
      },
      ConfigurationSetName: process.env.SES_CONFIGURATION_SET,
    })

    await this.client.send(command)
  }

  async sendBulkEmail(options: EmailOptions[]): Promise<void> {
    await Promise.all(
      options.map((option) => this.sendEmail(option))
    )
  }
}