/**
 * Share email: building the message. lib/email.js sends it.
 */

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escape text for use in HTML element content and attribute values.
 * @param {unknown} value
 * @returns {string}
 */
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

/** Strip CR/LF so user text can't add lines to a header such as Subject. */
const singleLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

/**
 * Build the share email. All user-supplied text is escaped.
 * @param {object} params
 * @param {string} params.senderName
 * @param {{ title: string, words: string[], grade: number }} params.story
 * @param {string} params.link
 * @param {string} [params.message]
 * @returns {{ subject: string, text: string, html: string }}
 */
export function buildShareEmail({ senderName, story, link, message }) {
  const sender = singleLine(senderName) || 'A teacher';
  const title = singleLine(story.title);
  const gradeLabel = story.grade === 0 ? 'Kindergarten' : `Grade ${story.grade}`;
  const summary = `This story contains ${story.words.length} sight words and is designed for ${gradeLabel} readers.`;

  const text = [
    `${sender} has shared a sight word story with you: "${title}"`,
    message ? `\n"${message}"\n` : '',
    summary,
    `\nView the story: ${link}`,
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af; font-size: 24px;">Sight Word Story</h1>
      <p>${escapeHtml(sender)} has shared a sight word story with you.</p>
      <h2 style="color: #1f2937; font-size: 20px;">${escapeHtml(title)}</h2>
      ${message ? `<p style="font-style: italic; color: #4b5563; padding: 10px; background-color: #f3f4f6; border-radius: 4px;">&ldquo;${escapeHtml(message)}&rdquo;</p>` : ''}
      <p>${escapeHtml(summary)}</p>
      <div style="margin: 20px 0;">
        <a href="${escapeHtml(link)}" style="background-color: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View the Story</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Anyone with this link can view the story.</p>
    </div>
  `;

  return { subject: `${sender} shared a sight word story with you: "${title}"`, text, html };
}

