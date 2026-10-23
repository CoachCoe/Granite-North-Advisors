// The one place the production domain lives. astro.config.mjs reads it for
// canonical URLs, Open Graph tags and the sitemap.
export const SITE_URL = 'https://granitenorthadvisors.com';

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
    email: 'john@cosmaneura.com',
    phone: '+15187274100',
    phoneDisplay: '518.727.4100',
  },
  {
    name: 'Shawn Coe',
    title: 'Principal',
    email: 'shawn.coe@me.com',
    phone: '+16033008082',
    phoneDisplay: '603.300.8082',
  },
] as const;

export const fhcEmail = 'GO-NORTH-FHC@healthynh.org';
