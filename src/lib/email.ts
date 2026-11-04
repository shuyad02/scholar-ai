import nodemailer from "nodemailer";

// =============================================
// Email Transporter Configuration
// Uses Gmail SMTP — works with any Gmail account
// Set GMAIL_USER and GMAIL_APP_PASSWORD in .env
// =============================================

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "",
    pass: process.env.GMAIL_APP_PASSWORD || "",
  },
});

const FROM_NAME = "ScholarAI";
const FROM_EMAIL = process.env.GMAIL_USER || "noreply@scholarai.org";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// =============================================
// HTML Email Templates
// =============================================

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>ScholarAI</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e40af 0%,#7c3aed 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                🎓 ScholarAI
              </h1>
              <p style="margin:6px 0 0;color:#c7d2fe;font-size:13px;letter-spacing:1px;text-transform:uppercase;">
                AI-Powered Scholarship Discovery
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 ScholarAI. This email was sent to you because you registered on ScholarAI.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
                <a href="${APP_URL}/dashboard" style="color:#6366f1;text-decoration:none;">Visit Dashboard</a>
                &nbsp;·&nbsp;
                <a href="${APP_URL}" style="color:#6366f1;text-decoration:none;">scholarai.vercel.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// =============================================
// Email 1: Welcome Email (after Sign-Up)
// =============================================
export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[ScholarAI Email] Gmail credentials not set. Skipping welcome email.");
    return false;
  }

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:700;">
      Welcome, ${params.name}! 👋
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:16px;line-height:1.6;">
      Aapka ScholarAI par swagat hai! Aapka account successfully create ho chuka hai. 
      Abhi apna Academic Profile complete karein taaki hum aapko <strong>100% accurate scholarship matches</strong> dikha sakein.
    </p>

    <!-- Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:#f5f3ff;border-radius:10px;padding:20px;">
          <table width="100%">
            <tr>
              <td width="36" valign="top">
                <div style="background:#7c3aed;color:white;font-size:14px;font-weight:700;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;">1</div>
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">Academic Profile Complete Karein</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">GPA, IELTS/TOEFL score, aur field of study dalein.</p>
              </td>
            </tr>
            <tr><td colspan="2" style="height:12px;"></td></tr>
            <tr>
              <td width="36" valign="top">
                <div style="background:#7c3aed;color:white;font-size:14px;font-weight:700;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;">2</div>
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">Instant AI Match Score Dekhein</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Fulbright, Chevening, DAAD ke liye 0–100% eligibility score paayein.</p>
              </td>
            </tr>
            <tr><td colspan="2" style="height:12px;"></td></tr>
            <tr>
              <td width="36" valign="top">
                <div style="background:#7c3aed;color:white;font-size:14px;font-weight:700;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;">3</div>
              </td>
              <td style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e40af;">AI Copilot se Doubts Poochein</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Official scholarship guidelines ka grounded answer, without hallucinations.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${APP_URL}/dashboard/profile"
            style="display:inline-block;background:linear-gradient(135deg,#1e40af,#7c3aed);color:#ffffff;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
            🚀 Complete Your Profile Now
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
      Questions? Just reply to this email. We are happy to help!
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: params.to,
      subject: `🎓 Welcome to ScholarAI, ${params.name}! Your Scholarship Journey Starts Now`,
      html: baseTemplate(content),
    });
    console.log(`[ScholarAI Email] Welcome email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("[ScholarAI Email] Failed to send welcome email:", error);
    return false;
  }
}

// =============================================
// Email 2: Login Notification
// =============================================
export async function sendLoginNotificationEmail(params: {
  to: string;
  name: string;
  loginTime: string;
}): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return false;

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      New Login Detected 🔐
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Hi <strong>${params.name}</strong>, aapke ScholarAI account mein successfully login hua hai.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;">
          <table>
            <tr>
              <td style="padding:4px 0;">
                <span style="font-size:13px;color:#374151;font-weight:600;">📅 Login Time:</span>
                <span style="font-size:13px;color:#6b7280;margin-left:8px;">${params.loginTime}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;">
                <span style="font-size:13px;color:#374151;font-weight:600;">✅ Status:</span>
                <span style="font-size:13px;color:#16a34a;margin-left:8px;font-weight:600;">Login Successful</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
      Agar ye aap nahi the, toh apna password turant change karein aur hume reply karein.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${APP_URL}/dashboard"
            style="display:inline-block;background:#1e40af;color:#ffffff;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">
            Go to Dashboard →
          </a>
        </td>
      </tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: params.to,
      subject: `🔐 ScholarAI Login Successful – ${params.loginTime}`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error("[ScholarAI Email] Failed to send login email:", error);
    return false;
  }
}

// =============================================
// Email 3: Scholarship Match Alert
// =============================================
export async function sendMatchAlertEmail(params: {
  to: string;
  name: string;
  scholarshipTitle: string;
  provider: string;
  score: number;
  status: string;
  awardAmount?: number;
  currency?: string;
  officialUrl?: string;
  nextSteps?: string[];
}): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return false;

  const scoreColor = params.score >= 80 ? "#16a34a" : params.score >= 50 ? "#d97706" : "#dc2626";
  const statusLabel = params.status === "HIGH_MATCH" ? "🟢 High Match" : params.status === "MODERATE_MATCH" ? "🟡 Moderate Match" : "🔴 Low Match";
  const amount = params.awardAmount ? `${params.currency || "USD"} ${params.awardAmount.toLocaleString()}` : "Full Funding";
  const steps = params.nextSteps?.slice(0, 3).map(step => `
    <tr>
      <td style="padding:6px 0;">
        <p style="margin:0;font-size:13px;color:#374151;">✅ ${step}</p>
      </td>
    </tr>
  `).join("") || "";

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      Scholarship Match Found! 🎯
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Hi <strong>${params.name}</strong>, aapke academic profile ke basis par hamare deterministic engine ne ek strong match dhundha hai:
    </p>

    <!-- Scholarship Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:linear-gradient(135deg,#eff6ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:12px;padding:24px;">
          <h3 style="margin:0 0 4px;color:#1e40af;font-size:18px;font-weight:700;">${params.scholarshipTitle}</h3>
          <p style="margin:0 0 16px;color:#7c3aed;font-size:13px;font-weight:600;">${params.provider}</p>
          <table width="100%">
            <tr>
              <td width="50%" style="padding:0 8px 0 0;">
                <div style="background:white;border-radius:8px;padding:14px;text-align:center;">
                  <p style="margin:0;font-size:32px;font-weight:800;color:${scoreColor};">${params.score}%</p>
                  <p style="margin:4px 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:600;">Match Score</p>
                </div>
              </td>
              <td width="50%" style="padding:0 0 0 8px;">
                <div style="background:white;border-radius:8px;padding:14px;text-align:center;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#374151;">${amount}</p>
                  <p style="margin:4px 0 0;font-size:11px;color:#6b7280;text-transform:uppercase;font-weight:600;">Award Value</p>
                </div>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:13px;color:#6b7280;text-align:center;">${statusLabel}</p>
        </td>
      </tr>
    </table>

    ${steps ? `
    <!-- Next Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f9fafb;border-radius:10px;padding:20px;">
          <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#374151;">Recommended Next Steps:</p>
          <table>${steps}</table>
        </td>
      </tr>
    </table>
    ` : ""}

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:0 8px 0 0;" width="50%">
          <a href="${APP_URL}/dashboard/matches"
            style="display:inline-block;background:linear-gradient(135deg,#1e40af,#7c3aed);color:#ffffff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;width:100%;text-align:center;box-sizing:border-box;">
            View Full Breakdown
          </a>
        </td>
        <td align="center" style="padding:0 0 0 8px;" width="50%">
          <a href="${params.officialUrl || APP_URL}"
            style="display:inline-block;background:white;color:#1e40af;border:2px solid #1e40af;padding:11px 24px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;width:100%;text-align:center;box-sizing:border-box;">
            Official Website ↗
          </a>
        </td>
      </tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: params.to,
      subject: `🎯 ${params.score}% Match Found: ${params.scholarshipTitle} – ScholarAI`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error("[ScholarAI Email] Failed to send match alert:", error);
    return false;
  }
}

// =============================================
// Email 4: Application Status Update
// =============================================
export async function sendApplicationUpdateEmail(params: {
  to: string;
  name: string;
  scholarshipTitle: string;
  provider: string;
  oldStatus: string;
  newStatus: string;
  notes?: string;
}): Promise<boolean> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return false;

  const statusMessages: Record<string, { emoji: string; label: string; tip: string }> = {
    INTERESTED: { emoji: "👀", label: "Interested", tip: "Scholarship ki requirements padh kar profile match confirm karein." },
    PREPARING_DOCUMENTS: { emoji: "📄", label: "Preparing Documents", tip: "Transcripts, LORs, aur SOP draft karna shuru kar dein." },
    READY_TO_APPLY: { emoji: "✅", label: "Ready to Apply", tip: "Sab kuch check karein aur official portal par apply karein." },
    SUBMITTED: { emoji: "📬", label: "Submitted", tip: "Application jama ho chuki hai. Acknowledgment email zaroor save karein." },
    UNDER_REVIEW: { emoji: "🔍", label: "Under Review", tip: "Interview preparation shuru kar dein aur patience rakhein." },
    APPROVED: { emoji: "🎉", label: "APPROVED!", tip: "Congratulations! Offer letter aur next steps ke liye email check karein." },
    REJECTED: { emoji: "😔", label: "Not Selected", tip: "Himmat mat harain! Other scholarships dekhein — aapke profile par aur bhi matches hain." },
  };

  const newSt = statusMessages[params.newStatus] || { emoji: "📋", label: params.newStatus, tip: "Dashboard par latest status check karein." };
  const isApproved = params.newStatus === "APPROVED";
  const headerColor = isApproved ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#1e40af 0%,#7c3aed 100%)";

  const content = `
    <h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:700;">
      Application Status Updated ${newSt.emoji}
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
      Hi <strong>${params.name}</strong>, aapki <strong>${params.scholarshipTitle}</strong> application ka status update hua hai:
    </p>

    <!-- Status Card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
          <table width="100%">
            <tr>
              <td style="padding:6px 0;">
                <span style="font-size:13px;color:#374151;font-weight:600;">📚 Scholarship:</span>
                <span style="font-size:13px;color:#6b7280;margin-left:8px;">${params.scholarshipTitle}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;">
                <span style="font-size:13px;color:#374151;font-weight:600;">🏛️ Provider:</span>
                <span style="font-size:13px;color:#6b7280;margin-left:8px;">${params.provider}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0;">
                <span style="font-size:13px;color:#374151;font-weight:600;">📊 New Status:</span>
                <span style="font-size:13px;font-weight:700;color:#1e40af;margin-left:8px;">${newSt.emoji} ${newSt.label}</span>
              </td>
            </tr>
            ${params.notes ? `
            <tr>
              <td style="padding:10px 0 0;">
                <p style="margin:0;font-size:13px;color:#374151;font-weight:600;">📝 Your Notes:</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;font-style:italic;">"${params.notes}"</p>
              </td>
            </tr>
            ` : ""}
          </table>
        </td>
      </tr>
    </table>

    <!-- Tip -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:16px 20px;">
          <p style="margin:0;font-size:13px;color:#1e40af;font-weight:600;">💡 Pro Tip:</p>
          <p style="margin:6px 0 0;font-size:13px;color:#374151;line-height:1.6;">${newSt.tip}</p>
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <a href="${APP_URL}/dashboard/applications"
            style="display:inline-block;background:linear-gradient(135deg,#1e40af,#7c3aed);color:#ffffff;padding:13px 36px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;">
            View Application Tracker →
          </a>
        </td>
      </tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: params.to,
      subject: `${newSt.emoji} Application Update: ${params.scholarshipTitle} is now "${newSt.label}" – ScholarAI`,
      html: baseTemplate(content),
    });
    return true;
  } catch (error) {
    console.error("[ScholarAI Email] Failed to send application update email:", error);
    return false;
  }
}
