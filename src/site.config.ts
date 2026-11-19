// The one place the production domain lives. astro.config.mjs reads it for
// canonical URLs, Open Graph tags and the sitemap.
export const SITE_URL = 'https://www.granitenorthadvisors.com';

export const company = {
  name: 'Granite North Advisors',
  legalName: 'Granite North Advisors LLC',
  street: '3 Deer Run Road',
  city: 'Bow',
  region: 'NH',
  postalCode: '03304',
};

export const principals = [
  {
    name: 'John Clemente',
    title: 'Principal',
    email: 'john@granitenorthadvisors.com',
    phone: '+15187274100',
    phoneDisplay: '518.727.4100',
  },
  {
    name: 'Shawn Coe',
    title: 'Principal',
    email: 'shawn@granitenorthadvisors.com',
    phone: '+16033008082',
    phoneDisplay: '603.300.8082',
  },
] as const;

export const fhcEmail = 'GO-NORTH-FHC@healthynh.org';

// Security Unblocker: the pre-SOC 2 questionnaire offering. The product is in
// development, so prices here are plans, not commitments. The waitlist is a
// pre-filled mailto: link (no form, no backend). To move signups to a shared
// inbox later, change waitlistEmail and nothing else.
export const unblocker = {
  path: '/security-unblocker/',
  name: 'Security Unblocker',
  waitlistEmail: 'shawn@granitenorthadvisors.com',
  betaPriceMonthly: 79,
  standardPriceMonthly: 99,
} as const;

const waitlistBody = [
  'Hi,',
  '',
  'Please add me to the Security Unblocker beta waitlist.',
  '',
  'Company:',
  'Website:',
  'Our stack (for example: AWS + GitHub + Google Workspace):',
  'The questionnaire or deal that is stuck (optional):',
  '',
  'Thanks',
].join('\n');

export const waitlistHref = `mailto:${unblocker.waitlistEmail}?subject=${encodeURIComponent(
  'Security Unblocker beta waitlist',
)}&body=${encodeURIComponent(waitlistBody)}`;
