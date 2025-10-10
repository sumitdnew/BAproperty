// Email provider service - can be configured for different email services
import type { InvitationData } from '../types/email'

// EmailJS types
declare global {
  interface Window {
    emailjs: {
      init: (config: { publicKey: string; blockHeadless?: boolean }) => void
      send: (serviceId: string, templateId: string, params: any, options?: any) => Promise<any>
    }
  }
}

export interface EmailConfig {
  provider: 'sendgrid' | 'ses' | 'mailgun' | 'gmail' | 'console' // console for testing
  apiKey?: string
  fromEmail?: string
  fromName?: string
  // Gmail SMTP credentials
  gmailUser?: string
  gmailPassword?: string
}

export class EmailProvider {
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent?: string,
    invitationData?: any
  ): Promise<boolean> {
    switch (this.config.provider) {
      case 'console':
        return this.sendToConsole(to, subject, htmlContent)
      
      case 'sendgrid':
        return this.sendViaSendGrid(to, subject, htmlContent, textContent)
      
      case 'ses':
        return this.sendViaSES(to, subject, htmlContent, textContent)
      
      case 'mailgun':
        return this.sendViaMailgun(to, subject, htmlContent, textContent)
      
      case 'gmail':
        return this.sendViaGmail(to, subject, htmlContent, textContent, invitationData)
      
      default:
        console.warn('Unknown email provider, falling back to console')
        return this.sendToConsole(to, subject, htmlContent)
    }
  }

  private async sendToConsole(to: string, subject: string, htmlContent: string): Promise<boolean> {
    console.log('📧 EMAIL WOULD BE SENT:')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('HTML Content:', htmlContent)
    console.log('---')
    return true
  }

  private async sendViaSendGrid(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string
  ): Promise<boolean> {
    if (!this.config.apiKey) {
      console.error('SendGrid API key not configured')
      return false
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
            subject: subject
          }],
          from: {
            email: this.config.fromEmail || 'noreply@yourdomain.com',
            name: this.config.fromName || 'Property Management'
          },
          content: [
            {
              type: 'text/html',
              value: htmlContent
            },
            ...(textContent ? [{
              type: 'text/plain',
              value: textContent
            }] : [])
          ]
        })
      })

      if (response.ok) {
        console.log('✅ Email sent successfully via SendGrid')
        return true
      } else {
        console.error('❌ SendGrid email failed:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('❌ SendGrid email error:', error)
      return false
    }
  }

  private async sendViaSES(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string
  ): Promise<boolean> {
    // AWS SES implementation would go here
    console.log('AWS SES not implemented yet')
    return false
  }

  private async sendViaMailgun(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string
  ): Promise<boolean> {
    // Mailgun implementation would go here
    console.log('Mailgun not implemented yet')
    return false
  }

  private async sendViaGmail(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string,
    invitationData?: any
  ): Promise<boolean> {
    if (!this.config.gmailUser || !this.config.gmailPassword) {
      console.error('Gmail credentials not configured')
      return false
    }

    try {
      // Use EmailJS for automatic email sending (free service)
      const emailjsUserId = import.meta.env.VITE_EMAILJS_USER_ID
      
      if (emailjsUserId) {
        // Try to send via EmailJS (automatic)
        return await this.sendViaEmailJS(to, subject, htmlContent, textContent, invitationData)
      } else {
        // Fallback to manual method
        return await this.sendViaGmailManual(to, subject, htmlContent, textContent)
      }
    } catch (error) {
      console.error('❌ Gmail email error:', error)
      return false
    }
  }

  private async sendViaEmailJS(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string,
    invitationData?: any
  ): Promise<boolean> {
    try {
      // Load EmailJS script if not already loaded
      if (!window.emailjs) {
        console.log('📧 Loading EmailJS script...')
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
        script.async = true
        document.head.appendChild(script)
        
        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
        })
        console.log('📧 EmailJS script loaded successfully')
      } else {
        console.log('📧 EmailJS script already loaded')
      }

      // Initialize EmailJS with Public Key
      const emailjsPublicKey = import.meta.env.VITE_EMAILJS_USER_ID
      const emailjsPrivateKey = import.meta.env.VITE_EMAILJS_PRIVATE_KEY
      console.log('📧 Initializing EmailJS with Public Key:', emailjsPublicKey)
      console.log('📧 Private Key available:', !!emailjsPrivateKey)
      
      window.emailjs.init({
        publicKey: emailjsPublicKey,
        blockHeadless: true
      })

      // Get current language setting to determine template
      let templateId = 'template_ln74jmx' // Default to English template
      let currentLanguage = 'en'
      
      try {
        // Import supabase dynamically to avoid circular dependencies
        const { supabase } = await import('../lib/supabase')
        
        // Fetch current language setting
        const { data: langData } = await supabase
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', 'default_language')
          .single()
        
        if (langData) {
          currentLanguage = langData.setting_value
        }
        
        // Fetch appropriate template based on language
        const templateKey = `email_template_${currentLanguage}`
        const { data: templateData } = await supabase
          .from('app_settings')
          .select('setting_value')
          .eq('setting_key', templateKey)
          .single()
        
        if (templateData) {
          templateId = templateData.setting_value
          console.log(`📧 Using ${currentLanguage.toUpperCase()} template:`, templateId)
        }
      } catch (error) {
        console.warn('Could not fetch template from settings, using default:', error)
      }

      // Prepare email parameters
      const emailParams = {
        to_email: to,
        first_name: invitationData?.firstName || 'Tenant',
        last_name: invitationData?.lastName || 'Name',
        user_email: to,
        message: invitationData?.message || '',
        building_name: invitationData?.buildingName || 'Building Name',
        apartment_unit: invitationData?.apartmentUnit || 'Apartment Unit',
        temp_password: invitationData?.tempPassword || 'TempPassword123!',
        login_url: `${window.location.origin}/login`,
        signup_url: `${window.location.origin}/invite?email=${encodeURIComponent(to)}`
      }
      
      console.log('📧 Sending EmailJS request with params:', emailParams)
      console.log('📧 Service ID:', 'service_7n6g698')
      console.log('📧 Template ID:', templateId)
      console.log('📧 Language:', currentLanguage)
      
      // Send email using proper EmailJS API with private key
      const result = await window.emailjs.send(
        'service_7n6g698', // Your actual EmailJS Service ID
        templateId, // Dynamic template ID based on language
        emailParams,
        {
          publicKey: emailjsPublicKey,
          privateKey: emailjsPrivateKey
        }
      ).then(
        (response) => {
          console.log('✅ SUCCESS!', response.status, response.text)
          console.log('📧 EmailJS Response Details:', {
            status: response.status,
            text: response.text,
            response: response
          })
          return true
        },
        (error) => {
          console.log('❌ FAILED...', error)
          console.error('📧 EmailJS Error Details:', error)
          return false
        }
      )

      return result
    } catch (error) {
      console.error('❌ EmailJS error:', error)
      return false
    }
  }

  private async sendViaGmailManual(
    to: string, 
    subject: string, 
    htmlContent: string, 
    textContent?: string
  ): Promise<boolean> {
    // Create a mailto link for Gmail (fallback approach)
    const textBody = textContent || this.stripHtml(htmlContent)
    const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody)}`
    
    // For now, we'll use a simple approach that opens Gmail compose
    // This is a fallback since we can't directly send SMTP from browser
    console.log('📧 Gmail SMTP Email Ready:')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('From:', this.config.gmailUser)
    console.log('---')
    console.log('HTML Content:', htmlContent)
    console.log('---')
    console.log('Text Content:', textBody)
    console.log('---')
    console.log('📧 To send this email:')
    console.log('1. Copy the content above')
    console.log('2. Go to Gmail.com')
    console.log('3. Login with:', this.config.gmailUser)
    console.log('4. Compose new email')
    console.log('5. Paste the content')
    console.log('---')
    console.log('Or click this mailto link:', mailtoLink)
    
    // Try to open Gmail compose (may be blocked by browser)
    try {
      window.open(mailtoLink, '_blank')
    } catch (e) {
      console.log('Could not open mailto link (browser blocked)')
    }
    
    return true
  }

  private stripHtml(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }
}

// Default email provider instance
export const emailProvider = new EmailProvider({
  provider: 'gmail',
  fromEmail: 'barrioargentinaapp@gmail.com',
  fromName: 'Barrio Argentina Property Management',
  gmailUser: 'barrioargentinaapp@gmail.com',
  gmailPassword: import.meta.env.VITE_GMAIL_APP_PASSWORD // You'll need to set this
})
