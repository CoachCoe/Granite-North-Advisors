// Copy for the "how it will work" preview. The page renders the all-controls-on
// state at build time and the script swaps these strings when a switch flips,
// so both read from this one file and can't drift apart.

export type Posture = { pr: boolean; enc: boolean; mfa: boolean };

export const CONTROLS = [
  { key: 'pr', title: 'Code review required before merge', sub: 'GitHub branch protection on the main branch' },
  { key: 'enc', title: 'Customer data encrypted at rest', sub: 'Database and file storage settings' },
  { key: 'mfa', title: 'Multi-factor login for everyone', sub: 'Google Workspace, GitHub and the cloud console' },
] as const;

export const QUESTION_PR = 'Are production code changes peer-reviewed before release?';
export const QUESTION_ENC = 'Is customer data encrypted at rest, and is multi-factor login required for administrators?';

export function answerPr(p: Posture): { text: string; ok: boolean } {
  return p.pr
    ? {
        ok: true,
        text: 'Yes. Changes to the main branch need at least one approved review and passing checks before they can be merged.',
      }
    : {
        ok: false,
        text: "Not yet. Reviews aren't required on every repository. Planned fix: turn on required reviews for the main branch before the pilot starts.",
      };
}

export function answerEncMfa(p: Posture): { text: string; ok: boolean } {
  if (p.enc && p.mfa) {
    return {
      ok: true,
      text: 'Yes. Customer databases and file storage are encrypted at rest, data is encrypted in transit, and multi-factor login is required for administrator accounts.',
    };
  }
  if (!p.enc && !p.mfa) {
    return {
      ok: false,
      text: 'Partly. Data is encrypted in transit. Encryption at rest and required multi-factor login are not in place yet. Planned fix: both, before customer data is onboarded.',
    };
  }
  if (!p.enc) {
    return {
      ok: false,
      text: 'Partly. Multi-factor login is required for administrators. Encryption at rest is not on for every data store yet. Planned fix: migrate the remaining storage.',
    };
  }
  return {
    ok: false,
    text: 'Partly. Data is encrypted at rest and in transit. Multi-factor login is not yet required for every administrator account. Planned fix: turn it on for all accounts.',
  };
}

export function countVerified(p: Posture): number {
  return (p.pr ? 1 : 0) + (p.enc ? 1 : 0) + (p.mfa ? 1 : 0);
}

// Calculator: shows what the status quo costs. It deliberately makes no claim
// about how much time the product will save.
export const CALC_DEFAULTS = { questionnairesPerQuarter: 3, hoursEach: 16, hourlyCost: 150 } as const;

export function calc(questionnairesPerQuarter: number, hoursEach: number, hourlyCost: number, monthlyPrice: number) {
  const hoursPerYear = questionnairesPerQuarter * 4 * hoursEach;
  return {
    hoursPerYear,
    timeCostPerYear: hoursPerYear * hourlyCost,
    planPerYear: monthlyPrice * 12,
  };
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const formatUsd = (n: number): string => usd.format(n);
export const formatHours = (n: number): string => `${n.toLocaleString('en-US')} hrs`;
