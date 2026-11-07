/** @jest-environment node */
import { getEmailConfig, sendEmail } from '../email';

const mockSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({ emails: { send: mockSend } })),
}));

const { Resend } = require('resend');

const mail = { to: 'parent@example.com', subject: 'A story', text: 'Read it', html: '<p>Read it</p>' };
const config = { apiKey: 're_test', from: 'Sight Word Stories <stories@example.com>' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getEmailConfig', () => {
  it('needs both the API key and the from address', () => {
    expect(getEmailConfig({})).toBeNull();
    expect(getEmailConfig({ RESEND_API_KEY: 're_test' })).toBeNull();
    expect(getEmailConfig({ EMAIL_FROM: config.from })).toBeNull();
    expect(getEmailConfig({ RESEND_API_KEY: '  ', EMAIL_FROM: config.from })).toBeNull();
  });

  it('returns the trimmed settings', () => {
    expect(getEmailConfig({ RESEND_API_KEY: ' re_test ', EMAIL_FROM: ` ${config.from} ` })).toEqual(config);
  });
});

describe('sendEmail', () => {
  it('sends from the configured address with the given key', async () => {
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    await expect(sendEmail(config, mail)).resolves.toEqual({ id: 'email-1' });
    expect(Resend).toHaveBeenCalledWith('re_test');
    expect(mockSend).toHaveBeenCalledWith({ from: config.from, ...mail });
  });

  it('throws when Resend refuses the email, without the API key in the message', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: 'validation_error', statusCode: 403, message: 'The domain is not verified.' },
    });

    const sent = sendEmail(config, mail);
    await expect(sent).rejects.toThrow('validation_error (403): The domain is not verified.');
    await expect(sent).rejects.not.toThrow('re_test');
  });
});
