// Build check for MorQi Kids: fails (exit 1) if the level plan breaks Introduce → Practice → Combine → Twist,
// or if anything appears on a board before the puzzle that introduces it. Run: node tools/check-levels.mjs
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL(process.argv.find(a => a.endsWith('.html')) || '../kais-calm-quest.html', import.meta.url), 'utf8');
const m = /\/\*LEVEL_PLAN\*\/([\s\S]*?)\/\*END_LEVEL_PLAN\*\//.exec(html);
if (!m) { console.error('LEVEL_PLAN block not found'); process.exit(1); }
const { LEVEL_PLAN, checkLevelPlan } = new Function(`${m[1]}; return { LEVEL_PLAN, checkLevelPlan };`)();
const intro = Object.fromEntries(LEVEL_PLAN.filter(l => l.introduces).map(l => [l.introduces, l.id]));
const step = l => l.introduces ? 'Introduce' : (LEVEL_PLAN[l.id - 2] || {}).introduces && LEVEL_PLAN[l.id - 2].introduces !== 'match' ? 'Practice' : l.twist ? 'Twist' : '';
if (process.argv.includes('--table')) {
  console.log('| Puzzle | Introduces | Step | Obstacles on the board | Power-ups and mechanics active |');
  console.log('|---|---|---|---|---|');
  LEVEL_PLAN.forEach(l => console.log(`| ${l.id} | ${l.introduces || ''} | ${step(l)} | ${l.obstacles.join(', ') || 'none'} | ${Object.keys(intro).filter(k => !['clouds', 'knots', 'storm'].includes(k) && intro[k] <= l.id).join(', ')} |`));
}
const errs = checkLevelPlan(LEVEL_PLAN);
if (errs.length) { console.error(`LEVEL_PLAN: ${errs.length} problem(s)\n` + errs.join('\n')); process.exit(1); }
console.log(`LEVEL_PLAN ok: ${LEVEL_PLAN.length} puzzles, every item introduced before it appears, Introduce → Practice → Combine → Twist holds.`);
