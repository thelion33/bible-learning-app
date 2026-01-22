/**
 * Email utilities using Resend
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface NewLessonEmailData {
  lessonId: string
  lessonTitle: string
  summary: string
  videoTitle: string
  publishedAt: string
  appUrl: string
}

/**
 * Send a new lesson notification email to a user
 */
export async function sendNewLessonEmail(
  toEmail: string,
  data: NewLessonEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    const formattedDate = new Date(data.publishedAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const { error } = await resend.emails.send({
      from: 'Revival Today Prosperity Academy <hello@prosperity.academy>',
      to: toEmail,
      subject: `New Message: ${data.lessonTitle}`,
      html: generateLessonEmailHTML(data, formattedDate),
    })

    if (error) {
      console.error(`Failed to send email to ${toEmail}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error(`Error sending email to ${toEmail}:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Send new lesson notifications to multiple users
 */
export async function sendBulkNewLessonEmails(
  userEmails: string[],
  lessonData: NewLessonEmailData
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0

  // Send emails in batches to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < userEmails.length; i += batchSize) {
    const batch = userEmails.slice(i, i + batchSize)
    
    const results = await Promise.allSettled(
      batch.map(email => sendNewLessonEmail(email, lessonData))
    )

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        sent++
      } else {
        failed++
        console.error(`Failed to send to ${batch[index]}:`, 
          result.status === 'fulfilled' ? result.value.error : result.reason
        )
      }
    })

    // Small delay between batches
    if (i + batchSize < userEmails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return { sent, failed }
}

/**
 * Generate HTML email template for new lesson notification
 */
function generateLessonEmailHTML(data: NewLessonEmailData, formattedDate: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message Available</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #003366 0%, #001f3f 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                🎓 New Message Available!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                A new message has been added to Revival Today Prosperity Academy and is ready for you to learn from:
              </p>

              <!-- Lesson Title -->
              <div style="background-color: #f8fafc; border-left: 4px solid #003366; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
                <h2 style="margin: 0 0 12px 0; color: #003366; font-size: 22px; font-weight: 600; line-height: 1.3;">
                  ${data.lessonTitle}
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  📅 ${formattedDate}
                </p>
              </div>

              <!-- Summary -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                  What You'll Learn:
                </h3>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.7;">
                  ${data.summary}
                </p>
              </div>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${data.appUrl}/learn/${data.lessonId}" 
                       style="display: inline-block; background-color: #003366; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; transition: background-color 0.2s;">
                      Start Learning →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Original Video Link -->
              <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px;">
                  Original message:
                </p>
                <a href="https://www.youtube.com/watch?v=${data.videoTitle.split('|')[0].trim()}" 
                   style="color: #003366; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Watch on YouTube →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                Continue your spiritual growth journey
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Revival Today Prosperity Academy
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
