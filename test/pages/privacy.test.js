import { render, screen, within } from '@testing-library/react';
import PrivacyPage from '../../pages/privacy';

const nextConfig = require('../../next.config');

/** Outside hosts the browser may load code from or send requests to, and the name the privacy page uses for each. */
const SERVICE_NAMES = {
  'api.anthropic.com': 'Anthropic',
  'cdn.jsdelivr.net': 'jsDelivr',
};

/** Hosts in the Content-Security-Policy's script-src and connect-src, other than this site. */
const outsideHosts = async () => {
  const rules = await nextConfig.headers();
  const policy = rules[0].headers.find(({ key }) => key === 'Content-Security-Policy').value;
  const sources = policy
    .split(';')
    .map((part) => part.trim().split(/\s+/))
    .filter(([directive]) => directive === 'script-src' || directive === 'connect-src')
    .flatMap(([, ...rest]) => rest)
    .filter((source) => source.startsWith('https://'));
  return [...new Set(sources.map((source) => new URL(source).hostname))];
};

describe('Privacy page', () => {
  it('gives the contact address for privacy requests', () => {
    render(<PrivacyPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Privacy' })).toBeInTheDocument();
    const contacts = screen.getAllByRole('link', { name: 'cesaire@sheetsolved.com' });
    expect(contacts.length).toBeGreaterThan(0);
    contacts.forEach((link) => expect(link).toHaveAttribute('href', 'mailto:cesaire@sheetsolved.com'));
  });

  it('points to the Information Regulator for complaints', () => {
    render(<PrivacyPage />);

    expect(screen.getByRole('link', { name: 'Information Regulator' })).toHaveAttribute('href', 'https://inforegulator.org.za/');
  });

  it('names each outside service the browser is allowed to reach', async () => {
    render(<PrivacyPage />);
    const services = screen.getByRole('region', { name: 'Other services' });

    const hosts = await outsideHosts();
    expect(hosts.length).toBeGreaterThan(0);
    hosts.forEach((host) => {
      // A new host in the policy needs a line on the privacy page and a name here
      expect(SERVICE_NAMES).toHaveProperty([host]);
      expect(within(services).getByText(SERVICE_NAMES[host])).toBeInTheDocument();
    });
  });
});
