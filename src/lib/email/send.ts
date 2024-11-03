import { createTransport } from 'nodemailer'
import { getSetting } from '@/lib/settings'
import { decrypt } from '@/lib/security/encryption'
import { type EmailOptions } from './types'

export async function sendEmail(options: EmailOptions) {
  const settings = await getSetting('email')
  if (!settings) {
    throw new Error('Email settings not configured')
  }

  const transporter = await createEmailTransport(settings)
  
  return transporter.sendMail({
    from: settings.from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
}

export async function sendBulkEmail(options: EmailOptions[]) {
  const settings = await getSetting('email')
  if (!settings) {
    throw new Error('Email settings not configured')
  }

  const transporter = await createEmailTransport(settings)
  
  return Promise.all(
    options.map(option =>
      transporter.sendMail({
        from: settings.from,
        to: option.to,
        subject: option.subject,
        html: option.html,
        text: option.text,
      })
    )
  )
}

async function createEmailTransport(settings: any) {
  switch (settings.provider) {
    case 'smtp':
      return createTransport({
        host: settings.smtp.host,
        port: settings.smtp.port,
        secure: settings.smtp.secure,
        auth: {
          user: settings.smtp.username,
          pass: await decrypt(settings.smtp.password),
        },
      })

    case 'sendgrid':
      return createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: await decrypt(settings.sendgrid.apiKey),
        },
      })

    case 'ses':
      const AWS = require('aws-sdk')
      const ses = new AWS.SES({
        accessKeyId: settings.ses.accessKeyId,
        secretAccessKey: await decrypt(settings.ses.secretAccessKey),
        region: settings.ses.region,
      })
      return createTransport({ SES: { ses, aws: AWS } })

    default:
      throw new Error(`Unsupported email provider: ${settings.provider}`)
  }
}