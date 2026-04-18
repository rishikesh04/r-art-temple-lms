import { Resend } from 'resend';

// @desc    Submit feedback or bug report
// @route   POST /api/feedback
// @access  Private (Students and Admins)
export const submitFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: 'Type and message are required' });
    }

    if (!process.env.RESEND_API_KEY || !process.env.FEEDBACK_EMAIL) {
      console.warn('Feedback submitted but RESEND_API_KEY or FEEDBACK_EMAIL is not configured in .env');
      return res.status(500).json({ message: 'Email service is currently unavailable. Please try again later.' });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Construct the email body
    const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #ff5722; padding: 20px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">New ${type} Report</h2>
        </div>
        <div style="padding: 24px; background-color: #f8fafc;">
          <p style="margin: 0 0 16px; font-size: 16px; color: #334155; line-height: 1.5; white-space: pre-wrap;">${message}</p>
          
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 24px 0;" />
          
          <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">User Details</h3>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Name:</strong> ${req.user.name}</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Email:</strong> ${req.user.email}</p>
          <p style="margin: 4px 0; color: #0f172a;"><strong>Role:</strong> ${req.user.role}</p>
          ${req.user.classLevel ? `<p style="margin: 4px 0; color: #0f172a;"><strong>Class Level:</strong> ${req.user.classLevel}</p>` : ''}
        </div>
      </div>
    `;

    // Free Resend tier requires sending from onboarding@resend.dev to the verified email
    const { data, error } = await resend.emails.send({
      from: 'R Art Temple LMS <onboarding@resend.dev>',
      to: process.env.FEEDBACK_EMAIL,
      subject: `[${type}] New report from ${req.user.name}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(500).json({ message: 'Failed to send feedback email', error });
    }

    res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Error processing feedback', error: error.message });
  }
};
