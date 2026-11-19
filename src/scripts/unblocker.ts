// Behavior for the Security Unblocker page: tabs, the stack-settings preview
// and the cost calculator. Bundled and served from this site, so it satisfies
// the "script-src 'self'" policy. Everything it updates is already in the HTML,
// so the page reads fine if this doesn't run.

import {
  CONTROLS,
  CALC_DEFAULTS,
  answerEncMfa,
  answerPr,
  calc,
  countVerified,
  formatHours,
  formatUsd,
  type Posture,
} from '../data/unblocker-demo';
import { unblocker } from '../site.config';

function initTabs(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  if (tabs.length === 0) return;
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('aria-controls') ?? ''));

  const select = (index: number, moveFocus = false): void => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      const panel = panels[i];
      if (panel) panel.hidden = !on;
    });
    if (moveFocus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (event) => {
      let next: number;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = (i + 1) % tabs.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = (i - 1 + tabs.length) % tabs.length;
          break;
        case 'Home':
          next = 0;
          break;
        case 'End':
          next = tabs.length - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      select(next, true);
    });
  });
}

function setChip(el: Element | null, ok: boolean, okText: string, gapText: string): void {
  if (!el) return;
  el.textContent = ok ? okText : gapText;
  el.className = ok ? 'u-chip' : 'u-chip is-warn';
}

function initPreview(root: HTMLElement): void {
  const state: Posture = { pr: true, enc: true, mfa: true };

  const render = (): void => {
    for (const control of CONTROLS) {
      const on = state[control.key];
      const row = root.querySelector(`[data-control="${control.key}"] [data-status]`);
      setChip(row, on, 'Verified', 'Not found');
    }

    const count = countVerified(state);
    root.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = `${count} of 3 controls verified`;
      el.className = count === 3 ? 'u-chip' : 'u-chip is-warn';
    });

    const pr = answerPr(state);
    const encMfa = answerEncMfa(state);
    const prText = root.querySelector('[data-answer="pr"]');
    const encText = root.querySelector('[data-answer="encmfa"]');
    if (prText) prText.textContent = pr.text;
    if (encText) encText.textContent = encMfa.text;
    setChip(root.querySelector('[data-flag="pr"]'), pr.ok, 'Backed by evidence', 'Gap stated plainly');
    setChip(root.querySelector('[data-flag="encmfa"]'), encMfa.ok, 'Backed by evidence', 'Gap stated plainly');

    const evidence = root.querySelector('[data-evidence-count]');
    if (evidence) evidence.textContent = `${count} of 3`;
    const gaps = 3 - count;
    const gapsLine = root.querySelector<HTMLElement>('[data-gaps-line]');
    if (gapsLine) {
      gapsLine.hidden = gaps === 0;
      const gapsText = gapsLine.querySelector('[data-gaps-text]');
      if (gapsText) gapsText.textContent = gaps === 1 ? '1 open gap, with a planned fix' : `${gaps} open gaps, each with a planned fix`;
    }
  };

  root.querySelectorAll<HTMLButtonElement>('[data-switch]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.switch as keyof Posture;
      state[key] = !state[key];
      button.setAttribute('aria-checked', String(state[key]));
      render();
    });
  });

  render();
}

function initCalculator(root: HTMLElement): void {
  const q = root.querySelector<HTMLInputElement>('[data-input="q"]');
  const h = root.querySelector<HTMLInputElement>('[data-input="h"]');
  const r = root.querySelector<HTMLInputElement>('[data-input="r"]');
  if (!q || !h || !r) return;

  const set = (name: string, text: string): void => {
    root.querySelectorAll(`[data-out="${name}"]`).forEach((el) => {
      el.textContent = text;
    });
  };

  const update = (): void => {
    const qn = Number(q.value);
    const hn = Number(h.value);
    const rn = Number(r.value);
    const result = calc(qn, hn, rn, unblocker.betaPriceMonthly);
    set('q', qn === 1 ? '1 questionnaire' : `${qn} questionnaires`);
    set('h', `${hn} hrs`);
    set('r', `${formatUsd(rn)}/hr`);
    set('hours', formatHours(result.hoursPerYear));
    set('cost', formatUsd(result.timeCostPerYear));
    set('plan', formatUsd(result.planPerYear));
  };

  for (const input of [q, h, r]) input.addEventListener('input', update);

  q.value = String(CALC_DEFAULTS.questionnairesPerQuarter);
  h.value = String(CALC_DEFAULTS.hoursEach);
  r.value = String(CALC_DEFAULTS.hourlyCost);
  update();
}

document.querySelectorAll<HTMLElement>('[data-tabs]').forEach(initTabs);
document.querySelectorAll<HTMLElement>('[data-preview]').forEach(initPreview);
document.querySelectorAll<HTMLElement>('[data-calc]').forEach(initCalculator);
