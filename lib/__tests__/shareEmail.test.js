/** @jest-environment node */
import { escapeHtml, buildShareEmail, getSmtpConfig } from '../shareEmail';

describe('escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });

  it('handles null and numbers', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(3)).toBe('3');
  });
});

describe('buildShareEmail', () => {
  const story = { title: 'My <b>Story</b>', words: ['a', 'the'], grade: 0 };
  const link = 'https://example.com/shared-stories/abc?token=t';

  it('escapes the title, sender name and message in the HTML', () => {
    const { html } = buildShareEmail({
      senderName: '<script>x</script>',
      story,
      link,
      message: '<a href="https://phish.example">Click</a>',
    });

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>Story</b>');
    expect(html).not.toContain('href="https://phish.example"');
    expect(html).toContain('&lt;a href=&quot;https://phish.example&quot;&gt;');
    expect(html).toContain(`href="${link}"`);
  });

  it('keeps the subject on one line', () => {
    const { subject } = buildShareEmail({ senderName: 'Ms Smith\r\nBcc: x@y.com', story, link });

    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('includes a plain-text version with the link', () => {
    const { text } = buildShareEmail({ senderName: 'Ms Smith', story, link });

    expect(text).toContain(link);
    expect(text).toContain('Kindergarten');
  });
});

describe('getSmtpConfig', () => {
  const base = {
    EMAIL_SERVER_HOST: 'smtp.example.com',
    EMAIL_SERVER_USER: 'user@example.com',
    EMAIL_SERVER_PASSWORD: 'secret',
  };

  it('returns null when email is not configured', () => {
    expect(getSmtpConfig({})).toBeNull();
    expect(getSmtpConfig({ ...base, EMAIL_SERVER_PASSWORD: '' })).toBeNull();
  });

  it('uses implicit TLS on port 465, given as a string', () => {
    expect(getSmtpConfig({ ...base, EMAIL_SERVER_PORT: '465' }).transport).toMatchObject({ port: 465, secure: true });
  });

  it('uses STARTTLS on other ports and defaults to 587', () => {
    expect(getSmtpConfig({ ...base, EMAIL_SERVER_PORT: '587' }).transport.secure).toBe(false);
    expect(getSmtpConfig(base).transport.port).toBe(587);
  });

  it('defaults the from address to the SMTP user', () => {
    expect(getSmtpConfig(base).from).toContain('user@example.com');
    expect(getSmtpConfig({ ...base, EMAIL_FROM: 'Stories <a@b.com>' }).from).toBe('Stories <a@b.com>');
  });
});
