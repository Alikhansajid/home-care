import { Resend } from "resend";

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Return a dummy object during build to prevent crashes
    return {
      emails: {
        send: async () => ({ id: "dummy" }),
      },
    } as any;
  }
  return new Resend(apiKey);
};

export const resend = getResend();

export async function sendMaintenanceReminder({
  to,
  userName,
  taskTitle,
  dueDate,
  homeName,
}: {
  to: string;
  userName: string;
  taskTitle: string;
  dueDate: string;
  homeName: string;
}) {
  return await resend.emails.send({
    from: "HomeCare <reminders@homecare.app>",
    to,
    subject: `Reminder: ${taskTitle} due soon`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏠 HomeCare</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Home Maintenance Reminder</p>
        </div>
        <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1e293b; margin: 0 0 16px;">Hi ${userName},</h2>
          <p style="color: #64748b; line-height: 1.6;">You have a maintenance task coming up for <strong>${homeName}</strong>:</p>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin: 0 0 8px;">${taskTitle}</h3>
            <p style="color: #64748b; margin: 0;">Due: <strong>${dueDate}</strong></p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/homeowner/maintenance" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
            View Task →
          </a>
        </div>
      </div>
    `,
  });
}
