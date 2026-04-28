const { google } = require('googleapis');

// ─────────────────────────────────────────────
// Service account auth
// Download your service account JSON from Google Cloud Console
// and set GOOGLE_SERVICE_ACCOUNT_JSON in .env as a single-line JSON string
// ─────────────────────────────────────────────
const getCalendarClient = () => {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
};

// ─────────────────────────────────────────────
// Create a calendar event and invite attendees
// calendarId: use 'primary' or a shared calendar ID from your service account
// ─────────────────────────────────────────────
const createCalendarEvent = async ({
  summary,
  description,
  startDateTime,
  endDateTime,
  attendeeEmails = [],
  location = '',
}) => {
  try {
    const calendar = getCalendarClient();
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    const event = {
      summary,
      description,
      location,
      start: { dateTime: new Date(startDateTime).toISOString(), timeZone: 'Asia/Dhaka' },
      end:   { dateTime: new Date(endDateTime).toISOString(),   timeZone: 'Asia/Dhaka' },
      // Attendees require Domain-Wide Delegation on free accounts
      // Events are created on the shared calendar and link is sent via email instead
      // attendees: attendeeEmails.filter(Boolean).map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 },
        ],
      },
      sendUpdates: 'all', // sends invite emails to attendees
    };

    const response = await calendar.events.insert({ calendarId, resource: event });
    console.log(`✅ Calendar event created: ${response.data.htmlLink}`);
    return response.data;
  } catch (err) {
    console.error('❌ Google Calendar error:', err?.message || err);
    return null;
  }
};

// ─────────────────────────────────────────────
// Preset: Milestone approved
// ─────────────────────────────────────────────
const createMilestoneEvent = async ({ thesisTitle, studentEmail, supervisorEmail, approvedAt }) => {
  const start = approvedAt ? new Date(approvedAt) : new Date();
  const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min block

  return createCalendarEvent({
    summary: `✅ Milestone Approved — ${thesisTitle}`,
    description: `A thesis milestone has been approved for "${thesisTitle}". Student and supervisor notified.`,
    startDateTime: start,
    endDateTime: end,
    attendeeEmails: [studentEmail, supervisorEmail],
  });
};

// ─────────────────────────────────────────────
// Preset: Defense date scheduled
// ─────────────────────────────────────────────
const createDefenseEvent = async ({ thesisTitle, studentEmail, supervisorEmail, defenseDate }) => {
  const start = new Date(defenseDate);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hour block

  return createCalendarEvent({
    summary: `🎓 Thesis Defense — ${thesisTitle}`,
    description: `Thesis defense scheduled for "${thesisTitle}".`,
    startDateTime: start,
    endDateTime: end,
    attendeeEmails: [studentEmail, supervisorEmail],
  });
};

// ─────────────────────────────────────────────
// Preset: Supervision meeting
// ─────────────────────────────────────────────
const createMeetingEvent = async ({ thesisTitle, studentEmail, supervisorEmail, meetingDate, meetingLink }) => {
  const start = new Date(meetingDate);
  const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour

  return createCalendarEvent({
    summary: `📅 Supervision Meeting — ${thesisTitle}`,
    description: `Supervision meeting for "${thesisTitle}".${meetingLink ? `\n\nJoin: ${meetingLink}` : ''}`,
    location: meetingLink || '',
    startDateTime: start,
    endDateTime: end,
    attendeeEmails: [studentEmail, supervisorEmail],
  });
};

module.exports = {
  createCalendarEvent,
  createMilestoneEvent,
  createDefenseEvent,
  createMeetingEvent,
};