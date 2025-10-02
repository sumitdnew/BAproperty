// Simple invitation service that creates a signup link
import { supabase } from '../lib/supabase'
import { emailProvider } from './emailProvider'
import type { InvitationData } from '../types/email'

// Re-export for convenience
export type { InvitationData } from '../types/email'

export class InvitationService {
  private static instance: InvitationService

  public static getInstance(): InvitationService {
    if (!InvitationService.instance) {
      InvitationService.instance = new InvitationService()
    }
    return InvitationService.instance
  }

  async createInvitationLink(invitationData: InvitationData): Promise<string> {
    // Create a simple signup link with invitation data
    const baseUrl = window.location.origin
    const signupUrl = `${baseUrl}/signup`
    
    // Encode invitation data in URL parameters
    const params = new URLSearchParams({
      email: invitationData.email,
      firstName: invitationData.firstName,
      lastName: invitationData.lastName,
      buildingId: invitationData.buildingId,
      apartmentId: invitationData.apartmentId,
      message: invitationData.message || ''
    })
    
    return `${signupUrl}?${params.toString()}`
  }

  async sendInvitationEmail(
    invitationData: InvitationData, 
    loginUrl?: string, 
    tempPassword?: string,
    buildingName?: string,
    apartmentUnit?: string
  ): Promise<void> {
    const signupLink = await this.createInvitationLink(invitationData)
    
    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Property Management Portal</h2>
        
        <p>Dear ${invitationData.firstName} ${invitationData.lastName},</p>
        
        <p>Your account has been created and you can now access the property management portal for your new apartment.</p>
        
        ${invitationData.message ? `<p><strong>Personal Message:</strong> ${invitationData.message}</p>` : ''}
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Apartment Details:</h3>
          <p><strong>Building:</strong> ${invitationData.buildingId}</p>
          <p><strong>Apartment:</strong> ${invitationData.apartmentId}</p>
        </div>
        
        ${loginUrl && tempPassword ? `
        <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
          <h3 style="margin-top: 0; color: #007bff;">Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${invitationData.email}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p style="color: #666; font-size: 14px;"><em>Please change your password after your first login.</em></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        ` : `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${signupLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Create Your Account
          </a>
        </div>
        `}
        
        <p>Once you log in, you will be able to:</p>
        <ul>
          <li>View your lease information</li>
          <li>Submit maintenance requests</li>
          <li>Make payments</li>
          <li>Communicate with property management</li>
        </ul>
        
        <p>If you have any questions, please contact us.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This invitation will expire in 7 days. If you didn't expect this invitation, please ignore this email.
        </p>
      </div>
    `
    
    // Send the email using the configured email provider
    const success = await emailProvider.sendEmail(
      invitationData.email,
      'Welcome to Property Management Portal',
      emailContent,
      `Welcome to Property Management Portal\n\nDear ${invitationData.firstName} ${invitationData.lastName},\n\nYour account has been created. ${loginUrl && tempPassword ? `\n\nLogin Credentials:\nEmail: ${invitationData.email}\nPassword: ${tempPassword}` : ''}\n\n${loginUrl ? `Login: ${loginUrl}` : `Signup: ${signupLink}`}`,
      {
        firstName: invitationData.firstName,
        lastName: invitationData.lastName,
        message: invitationData.message,
        buildingName: buildingName,
        apartmentUnit: apartmentUnit,
        tempPassword: tempPassword
      }
    )
    
    if (success) {
      console.log('✅ Invitation email sent successfully')
    } else {
      console.error('❌ Failed to send invitation email')
    }
  }
}

export default InvitationService
