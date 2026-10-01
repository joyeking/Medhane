import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const pages = ['index.html', 'blends.html', 'herbs.html', 'shop.html', 'story.html', 'faq.html'];

let problems = 0;
const fail = (m) => { console.log('  FAIL  ' + m); problems++; };
const ok = (m) => console.log('  ok    ' + m);

// Collect every id per page so anchor links can be verified
const ids = {};
const links = {};
for (const p of pages) {
  const html = readFileSync(resolve(root, p), 'utf8');
  ids[p] = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  links[p] = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
}

console.log('\n== File + asset resolution ==');
for (const p of pages) {
  const seen = new Set();
  for (const raw of links[p]) {
    if (seen.has(raw)) continue;
    seen.add(raw);
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(raw)) continue;

    const [file, hash] = raw.split('#');
    const target = resolve(dirname(resolve(root, p)), file);
    if (!existsSync(target)) { fail(`${p} -> missing file "${raw}"`); continue; }
    if (hash) {
      const targetPage = pages.find((q) => resolve(root, q) === target);
      if (targetPage && !ids[targetPage].has(hash)) {
        fail(`${p} -> ${raw} (anchor #${hash} not found in ${targetPage})`);
      }
    }
  }
}
if (!problems) ok('every local href/src and cross-page anchor resolves');

console.log('\n== Same-page anchors ==');
for (const p of pages) {
  for (const raw of links[p]) {
    if (!raw.startsWith('#') || raw === '#') continue;
    const hash = raw.slice(1);
    if (!ids[p].has(hash)) fail(`${p} -> ${raw} (anchor missing on same page)`);
  }
}
ok('checked');

console.log('\n== Duplicate ids ==');
for (const p of pages) {
  const html = readFileSync(resolve(root, p), 'utf8');
  const found = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = found.filter((v, i) => found.indexOf(v) !== i);
  if (dupes.length) fail(`${p} duplicate ids: ${[...new Set(dupes)].join(', ')}`);
}
ok('checked');

console.log('\n== Data-hook integrity ==');
// filter button target ids must match an element id
for (const p of pages) {
  const html = readFileSync(resolve(root, p), 'utf8');
  for (const m of html.matchAll(/data-(?:filters|stat-list|segment)="([^"]+)"/g)) {
    if (!ids[p].has(m[1])) fail(`${p}: data hook "${m[1]}" has no matching element id`);
  }
  // every add-to-bag id that appears twice should be intentional (cards repeat) — just list them
  const adds = [...html.matchAll(/data-add="([^"]+)"/g)].map((m) => m[1]);
  if (adds.length) ok(`${p}: ${adds.length} add-to-bag buttons (${new Set(adds).size} distinct products)`);
}

console.log('\n== add-to-bag ids match across pages ==');
const bag = {};
for (const p of pages) {
  const html = readFileSync(resolve(root, p), 'utf8');
  bag[p] = new Set([...html.matchAll(/data-add="([^"]+)"/g)].map((m) => m[1]));
}
const allBags = new Set(Object.values(bag).flatMap((s) => [...s]));
for (const id of allBags) {
  const where = pages.filter((p) => bag[p].has(id));
  if (where.length < 2) console.log(`  note  "${id}" appears only on ${where.join(', ')}`);
}
ok(`${allBags.size} distinct product ids across ${pages.length} pages`);

console.log('\n== CSS balance ==');
const css = readFileSync(resolve(root, 'assets/app.css'), 'utf8');
const open = (css.match(/{/g) ?? []).length;
const close = (css.match(/}/g) ?? []).length;
open === close ? ok(`${open} braces balanced`) : fail(`${open} open vs ${close} close braces`);

console.log('\n== CSS custom properties defined vs used ==');
const defined = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]));
const used = new Set([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
const missing = [...used].filter((v) => !defined.has(v));
if (missing.length) {
  for (const v of used) if (!defined.has(v)) fail(`var(${v}) used but never defined`);
} else ok(`${defined.size} tokens defined, ${used.size} used, none missing`);

console.log('\n== HTML structure ==');
for (const p of pages) {
  const html = readFileSync(resolve(root, p), 'utf8');
  const openTags = (html.match(/<(div|section|article|nav|main|header|footer|dl|ul|figure|details|table)\b/g) ?? []).length;
  const closeTags = (html.match(/<\/(div|section|article|nav|main|header|footer|dl|ul|figure|details|table)>/g) ?? []).length;
  const li = (html.match(/<li\b/g) ?? []).length;
  const liClose = (html.match(/<\/li>/g) ?? []).length;
  const dt = (html.match(/<dt\b/g) ?? []).length;
  const dd = (html.match(/<dd\b/g) ?? []).length;
  if (openTags !== closeTags) fail(`${p}: ${openTags} open vs ${closeTags} close block tags`);
  if (li !== liClose) fail(`${p}: ${li} <li> vs ${liClose} </li>`);
  if (dt !== dd) fail(`${p}: ${dt} <dt> vs ${dd} <dd> (dl requires matching pairs)`);
  const t = (p + '  ').slice(0, 14);
  ok(`${t} blocks ${openTags}/${closeTags}, li ${li}/${liClose}, dt/dd ${dt}/${dd}`);
}

console.log('\n== A11y basics ==');
for (const p of pages) {
  const html = readFileSync(resolve(root, p), 'utf8');
  if (!/<html lang="/.test(html)) fail(`${p}: no lang attribute`);
  if (!/<meta name="description"/.test(html)) fail(`${p}: no meta description`);
  if (!/<h1[\s>]/.test(html)) fail(`${p}: no h1`);
  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count > 1) fail(`${p}: ${h1Count} h1 elements`);
  // every svg without aria-hidden should be inside an aria-labelled anchor
  const rawSvgs = (html.match(/<svg(?![^>]*aria-hidden)/g) ?? []).length;
  if (rawSvgs) fail(`${p}: ${rawSvgs} <svg> without aria-hidden`);
  // buttons need a type
  const noType = (html.match(/<button(?![^>]*\btype=)/g) ?? []).length;
  if (noType) fail(`${p}: ${noType} <button> without explicit type`);
  ok(`${p}: lang, description, single h1, svg aria-hidden, button types`);
}

console.log('\n== Heading order (no skipped levels) ==');
for (const p of pages) {
  const html = readFileSync(resolve(root, p), 'utf8');
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  let prev = levels[0];
  let skips = 0;
  for (const l of levels) { if (l > prev + 1) skips++; prev = l; }
  skips ? fail(`${p}: ${skips} heading level skip(s) — ${levels.join(',')}`) : ok(`${p}: ${levels.length} headings, no skips`);
}

console.log(problems ? `\n${problems} PROBLEM(S)\n` : '\nAll checks passed.\n');
process.exit(problems ? 1 : 0);