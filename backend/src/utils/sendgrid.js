const sgMail = require('@sendgrid/mail');
const EmailEvent = require('../models/EmailEvent');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@acadexa.com';

// ─────────────────────────────────────────────
// Send a deadline reminder email to the supervisor
// ─────────────────────────────────────────────
const sendDeadlineReminder = async ({ deadline, daysLeft }) => {
  const {
    _id: deadlineId,
    studentId,
    supervisorId,
    supervisorEmail,
    studentEmail,
    thesisTitle,
    progressPercent,
  } = deadline;

  if (!supervisorEmail) {
    console.log(`⚠️ No supervisor email for deadline ${deadlineId} — skipping reminder`);
    return null;
  }

  const urgencyLabel =
    daysLeft <= 1  ? '🔴 CRITICAL — 1 Day Left' :
    daysLeft <= 7  ? '🟠 Urgent — 1 Week Left' :
    daysLeft <= 14 ? '🟡 Reminder — 2 Weeks Left' :
                     '🟢 Heads Up — 30 Days Left';

  const msg = {
    to:   supervisorEmail,
    from: FROM_EMAIL,
    subject: `[Acadexa] ${urgencyLabel} | ${thesisTitle}`,
    trackingSettings: {
      clickTracking:  { enable: true },
      openTracking:   { enable: true },  // ← SendGrid embeds pixel for open tracking
    },
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #1d4ed8; color: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
          <h2 style="margin: 0; font-size: 20px;">📅 Thesis Deadline Reminder</h2>
          <p style="margin: 6px 0 0; opacity: 0.85; font-size: 14px;">Acadexa Thesis Management System</p>
        </div>

        <p style="color: #374151; font-size: 15px;">Dear Supervisor,</p>
        <p style="color: #374151; font-size: 15px;">
          Your student's thesis deadline is approaching. Please review their progress and provide feedback.
        </p>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px; color: #374151;">
            <tr><td style="padding: 6px 0; color: #6b7280;">Student ID</td><td style="font-weight: 600;">${studentId}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Thesis Title</td><td style="font-weight: 600;">${thesisTitle}</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Days Remaining</td><td style="font-weight: 700; color: ${daysLeft <= 7 ? '#dc2626' : '#1d4ed8'};">${daysLeft} days</td></tr>
            <tr><td style="padding: 6px 0; color: #6b7280;">Progress</td><td style="font-weight: 600;">${progressPercent}%</td></tr>
          </table>
        </div>

        <p style="color: #6b7280; font-size: 13px; margin-top: 32px;">
          This is an automated reminder from Acadexa. Log in to review the student's latest progress update.
        </p>
      </div>
    `,
  };

  try {
    const [response] = await sgMail.send(msg);
    const messageId = response.headers['x-message-id'];

    // Record the email event in DB
    const emailEvent = await EmailEvent.create({
      studentId,
      supervisorId,
      supervisorEmail,
      studentEmail,
      deadlineId,
      messageId,
      subject: msg.subject,
      type: 'deadline_reminder',
      sentAt: new Date(),
    });

    console.log(`✅ Reminder sent to ${supervisorEmail} (${daysLeft} days) — msgId: ${messageId}`);
    return emailEvent;
  } catch (err) {
    console.error('❌ SendGrid error:', err?.response?.body || err.message);
    return null;
  }
};

// ─────────────────────────────────────────────
// Send a meeting scheduled notification
// ─────────────────────────────────────────────
const sendMeetingNotification = async ({ studentId, supervisorId, supervisorEmail, studentEmail, thesisTitle, meetingDate, meetingLink }) => {
  const msgs = [];

  const formattedDate = new Date(meetingDate).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
      <div style="background: #0f766e; color: white; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px;">
        <h2 style="margin: 0; font-size: 20px;">📆 Meeting Scheduled</h2>
        <p style="margin: 6px 0 0; opacity: 0.85; font-size: 14px;">Acadexa Thesis Management System</p>
      </div>
      <p style="color: #374151;">A thesis supervision meeting has been scheduled.</p>
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; font-size: 14px; color: #374151;">
          <tr><td style="padding: 6px 0; color: #6b7280;">Thesis</td><td style="font-weight: 600;">${thesisTitle}</td></tr>
          <tr><td style="padding: 6px 0; color: #6b7280;">Date & Time</td><td style="font-weight: 600;">${formattedDate}</td></tr>
          ${meetingLink ? `<tr><td style="padding: 6px 0; color: #6b7280;">Link</td><td><a href="${meetingLink}" style="color: #1d4ed8;">${meetingLink}</a></td></tr>` : ''}
        </table>
      </div>
      <p style="color: #6b7280; font-size: 13px;">This event has also been added to your Google Calendar.</p>
    </div>
  `;

  // Send to supervisor
  if (supervisorEmail) msgs.push({ to: supervisorEmail, from: FROM_EMAIL, subject: `[Acadexa] Meeting Scheduled — ${thesisTitle}`, html, trackingSettings: { openTracking: { enable: true } } });
  // Send to student
  if (studentEmail)    msgs.push({ to: studentEmail,    from: FROM_EMAIL, subject: `[Acadexa] Meeting Scheduled — ${thesisTitle}`, html });

  try {
    if (msgs.length > 0) await sgMail.send(msgs);
    console.log(`✅ Meeting notification sent`);
  } catch (err) {
    console.error('❌ SendGrid meeting email error:', err?.response?.body || err.message);
  }
};

module.exports = { sendDeadlineReminder, sendMeetingNotification };