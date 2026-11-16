import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(import.meta.dirname, "..", ".env") });

import { neon } from "@neondatabase/serverless";
import {
  LEVEL_REQUIREMENTS,
  SALARY_TIERS,
  calculateLevelBonus,
  calculateSalary,
} from "../src/lib/store";

const sql = neon(process.env["DATABASE_URL"]!);
const CUTOFF = "2026-10-30 23:59:59.999";
const CUTOFF_LABEL = "30 October 2026";

// ── Data ─────────────────────────────────────────────────────────────────────
const payoutRows = await sql`
  SELECT p.id, p.type, p.amount::text AS amount, p.user_id,
         u.name AS user_name, p.reference_id, ru.name AS ref_name,
         p.month, p.created_at::text AS created_at
  FROM payouts p
  LEFT JOIN users u ON u.id = p.user_id
  LEFT JOIN users ru ON ru.id = p.reference_id
  WHERE p.created_at <= ${CUTOFF}
  ORDER BY p.created_at`;

const userRows = await sql`
  SELECT id, parent_id AS "parentId", name, investment::text AS investment,
         investment_date::text AS investment_date, balance::text AS balance,
         activation_package, created_at::text AS created_at
  FROM users ORDER BY created_at`;

type PayoutRow = (typeof payoutRows)[number];
type UserRow = (typeof userRows)[number];

const users: UserRow[] = userRows;

// ── Referral + joining bonus (recorded) ─────────────────────────────────────
const referral = payoutRows.filter((p) => p.type === "direct_referral");
const joining = payoutRows.filter((p) => p.type === "joining_bonus");

const sum = (rows: { amount: string }[]) =>
  rows.reduce((s, r) => s + Number(r.amount), 0);

const referralTotal = sum(referral);
const joiningTotal = sum(joining);

// monthly breakdown of referral income only
const monthly = new Map<string, { count: number; total: number }>();
for (const p of referral) {
  const m = p.created_at.slice(0, 7);
  const cur = monthly.get(m) ?? { count: 0, total: 0 };
  cur.count += 1;
  cur.total += Number(p.amount);
  monthly.set(m, cur);
}
const monthlyRows = [...monthly.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const walletBalance = users.reduce((s, u) => s + (Number(u.balance) || 0), 0);

// ── Level bonus (computed, mirrors app logic in src/lib/store.ts) ──────────
const levelPerUser: { id: string; name: string; levels: number; total: number }[] = [];
const levelTotals = new Map<number, { bonus: number; members: number }>();

for (const u of users) {
  const results = calculateLevelBonus(u.id, users as never);
  const total = results.reduce((s, r) => s + r.bonus, 0);
  const activeLevels = results.filter((r) => r.bonus > 0).length;
  if (total > 0) {
    levelPerUser.push({ id: u.id, name: u.name, levels: activeLevels, total });
    for (const r of results) {
    if (r.bonus <= 0) continue;
      const cur = levelTotals.get(r.level) ?? { bonus: 0, members: 0 };
      cur.bonus += r.bonus;
      cur.members += 1;
      levelTotals.set(r.level, cur);
    }
  }
}
levelPerUser.sort((a, b) => b.total - a.total);
const levelBonusTotal = levelPerUser.reduce((s, r) => s + r.total, 0);

// ── Salary (computed, mirrors app logic) ────────────────────────────────────
const salaryRows: { id: string; name: string; business: number; salary: number }[] = [];
const businessOf = (userId: string): number => {
  let total = 0;
  const queue = [userId];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const c of users) {
      if (c.parentId === cur) {
        total += Number(c.investment) || 0;
        queue.push(c.id);
      }
    }
  }
  return total;
};
for (const u of users) {
  const tier = calculateSalary(u.id, users as never);
  if (tier) {
    salaryRows.push({
      id: u.id,
      name: u.name,
      business: businessOf(u.id),
      salary: tier.monthlySalary,
    });
  }
}
salaryRows.sort((a, b) => b.business - a.business);
const highestBusiness = users
  .map((u) => ({ name: u.name, business: businessOf(u.id) }))
  .sort((a, b) => b.business - a.business)[0]!;

// ── Formatting helpers ──────────────────────────────────────────────────────
const inr = (n: number) =>
  "₹" +
  n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const esc = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const fmtDate = (ts: string) => {
  // "2026-08-26 11:14:44.314611" or ISO → "26 Aug 2026, 11:14"
  const d = new Date(ts.replace(" ", "T"));
  if (isNaN(d.getTime())) return esc(ts);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const monthLabel = (m: string) => {
  const [y, mo] = m.split("-");
  const names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${names[Number(mo) - 1]} ${y}`;
};

const recordedTotal = referralTotal + joiningTotal;
const grandTotal = recordedTotal + levelBonusTotal;

// ── HTML ────────────────────────────────────────────────────────────────────
const referralRowsHtml = referral
  .map(
    (p) => `<tr>
      <td class="mono">${esc(p.id)}</td>
      <td>${fmtDate(p.created_at)}</td>
      <td>${esc(p.user_name)} <span class="dim mono">${esc(p.user_id)}</span></td>
      <td>${esc(p.ref_name)} <span class="dim mono">${esc(p.reference_id)}</span></td>
      <td class="num">${inr(Number(p.amount))}</td>
    </tr>`
  )
  .join("");

const joiningRowsHtml = joining
  .map(
    (p) => `<tr>
      <td class="mono">${esc(p.id)}</td>
      <td>${fmtDate(p.created_at)}</td>
      <td>${esc(p.user_name)} <span class="dim mono">${esc(p.user_id)}</span></td>
      <td>${esc(p.ref_name)} <span class="dim mono">${esc(p.reference_id)}</span></td>
      <td class="num">${inr(Number(p.amount))}</td>
    </tr>`
  )
  .join("");

const monthlyRowsHtml = monthlyRows
  .map(
    ([m, v]) => `<tr>
      <td>${monthLabel(m)}</td>
      <td class="num">${v.count}</td>
      <td class="num">${inr(v.total)}</td>
    </tr>`
  )
  .join("");

const levelUserRowsHtml = levelPerUser
  .map(
    (r) => `<tr>
      <td>${esc(r.name)} <span class="dim mono">${esc(r.id)}</span></td>
      <td class="num">${r.levels}</td>
      <td class="num">${inr(r.total)}</td>
    </tr>`
  )
  .join("");

const levelDistRowsHtml = [...levelTotals.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(
    ([lvl, v]) => `<tr>
      <td class="num">${lvl}</td>
      <td class="num">${LEVEL_REQUIREMENTS[lvl - 1]!.percentage.toFixed(2)}%</td>
      <td class="num">${v.members}</td>
      <td class="num">${inr(v.bonus)}</td>
    </tr>`
  )
  .join("");

const salaryBodyHtml = salaryRows.length
  ? salaryRows
      .map(
        (r) => `<tr>
          <td>${esc(r.name)} <span class="dim mono">${esc(r.id)}</span></td>
          <td class="num">${inr(r.business)}</td>
          <td class="num">${inr(r.salary)} / month</td>
        </tr>`
      )
      .join("")
  : `<tr><td colspan="3" class="dim">No member has reached the minimum team business of ${inr(
      SALARY_TIERS[0]!.totalBusiness
    )}. Salary income till ${CUTOFF_LABEL}: <strong>${inr(0)}</strong>.</td></tr>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Tradebee Income Report — till ${CUTOFF_LABEL}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
    color: #1c1917; font-size: 12px; line-height: 1.45; margin: 0;
  }
  header { border-bottom: 3px solid #f59e0b; padding-bottom: 12px; margin-bottom: 18px; }
  h1 { font-size: 24px; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { color: #57534e; font-size: 12.5px; }
  .brand { color: #d97706; font-weight: 700; text-transform: uppercase; letter-spacing: .18em; font-size: 11px; }
  h2 {
    font-size: 15px; margin: 26px 0 8px; padding-bottom: 4px;
    border-bottom: 1px solid #e7e5e4; color: #92400e;
  }
  h3 { font-size: 13px; margin: 14px 0 6px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; }
  th {
    text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .05em;
    color: #57534e; background: #fafaf9; padding: 6px 8px; border-bottom: 2px solid #e7e5e4;
  }
  td { padding: 5px 8px; border-bottom: 1px solid #f0efec; vertical-align: top; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  tr.total td { font-weight: 700; background: #fffbeb; border-top: 2px solid #f59e0b; border-bottom: none; }
  .mono { font-family: Consolas, "Courier New", monospace; font-size: 10.5px; }
  .dim { color: #8a857e; }
  .num { font-variant-numeric: tabular-nums; }
  .cards { display: flex; gap: 10px; margin: 14px 0 4px; }
  .card {
    flex: 1; border: 1px solid #e7e5e4; border-radius: 8px; padding: 10px 12px;
    background: #fafaf9;
  }
  .card .label { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; color: #78716c; }
  .card .value { font-size: 19px; font-weight: 700; margin-top: 3px; color: #1c1917; }
  .card .note { font-size: 10.5px; color: #8a857e; margin-top: 2px; }
  .card.accent { background: #fffbeb; border-color: #fde68a; }
  .card.accent .value { color: #b45309; }
  .badge {
    display: inline-block; font-size: 9.5px; font-weight: 700; letter-spacing: .05em;
    text-transform: uppercase; padding: 1px 6px; border-radius: 999px; vertical-align: 1px;
  }
  .badge.rec { background: #dcfce7; color: #166534; }
  .badge.comp { background: #e0e7ff; color: #3730a3; }
  .badge.nil { background: #f3f4f6; color: #57534e; }
  .notes { font-size: 11px; color: #57534e; }
  .notes li { margin-bottom: 4px; }
  .section-intro { color: #57534e; margin: 2px 0 8px; }
  footer {
    margin-top: 28px; padding-top: 8px; border-top: 1px solid #e7e5e4;
    font-size: 10.5px; color: #8a857e;
  }
  .avoid-break { break-inside: avoid; }
</style>
</head>
<body>

<header>
  <div class="brand">Tradebee · Income Report</div>
  <h1>Every income type — till ${CUTOFF_LABEL}</h1>
  <div class="sub">
    Reporting period: platform inception (26 Aug 2026) → <strong>30 Oct 2026 (inclusive)</strong>
    &nbsp;·&nbsp; Generated ${new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}
    &nbsp;·&nbsp; All amounts in INR (₹)
  </div>
</header>

<div class="cards">
  <div class="card accent">
    <div class="label">Total income (all types)</div>
    <div class="value">${inr(grandTotal)}</div>
    <div class="note">recorded + computed</div>
  </div>
  <div class="card">
    <div class="label">Recorded payouts</div>
    <div class="value">${inr(recordedTotal)}</div>
    <div class="note">${payoutRows.length} transactions</div>
  </div>
  <div class="card">
    <div class="label">Level bonus (computed)</div>
    <div class="value">${inr(levelBonusTotal)}</div>
    <div class="note">${levelPerUser.length} beneficiaries</div>
  </div>
  <div class="card">
    <div class="label">Salary (computed)</div>
    <div class="value">${inr(salaryRows.reduce((s, r) => s + r.salary, 0))}</div>
    <div class="note">${salaryRows.length ? salaryRows.length + " qualifying" : "no qualifying member"}</div>
  </div>
</div>

<h2>1. Summary — income by type</h2>
<table>
  <thead>
    <tr>
      <th>Income type</th>
      <th>Source</th>
      <th class="num">Records</th>
      <th class="num">Amount till ${CUTOFF_LABEL}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Direct referral bonus <span class="dim">(5% of referral investment)</span></td>
      <td><span class="badge rec">Recorded</span></td>
      <td class="num">${referral.length}</td>
      <td class="num">${inr(referralTotal)}</td>
    </tr>
    <tr>
      <td>Joining bonus <span class="dim">(5% of activation package)</span></td>
      <td><span class="badge rec">Recorded</span></td>
      <td class="num">${joining.length}</td>
      <td class="num">${inr(joiningTotal)}</td>
    </tr>
    <tr>
      <td>Level bonus <span class="dim">(21-level pool, on downline investments)</span></td>
      <td><span class="badge comp">Computed</span></td>
      <td class="num">${levelPerUser.length} beneficiaries</td>
      <td class="num">${inr(levelBonusTotal)}</td>
    </tr>
    <tr>
      <td>Fixed salary <span class="dim">(team-business tiers)</span></td>
      <td><span class="badge ${salaryRows.length ? "comp" : "nil"}">${salaryRows.length ? "Computed" : "Not applicable"}</span></td>
      <td class="num">${salaryRows.length}</td>
      <td class="num">${inr(salaryRows.reduce((s, r) => s + r.salary, 0))}</td>
    </tr>
    <tr>
      <td>ROI / capital return <span class="dim">(investment plans)</span></td>
      <td><span class="badge nil">Not credited</span></td>
      <td class="num">0</td>
      <td class="num">${inr(0)}</td>
    </tr>
    <tr class="total">
      <td>Total</td>
      <td></td>
      <td class="num"></td>
      <td class="num">${inr(grandTotal)}</td>
    </tr>
  </tbody>
</table>

<h2>2. Direct referral bonus <span class="badge rec">Recorded</span></h2>
<p class="section-intro">
  5% credit to the direct upline whenever a referred member's investment is recorded.
  ${referral.length} transactions totalling <strong>${inr(referralTotal)}</strong>.
</p>

<h3>Month-wise</h3>
<table class="avoid-break">
  <thead><tr><th>Month</th><th class="num">Transactions</th><th class="num">Amount</th></tr></thead>
  <tbody>
    ${monthlyRowsHtml}
    <tr class="total"><td>All months</td><td class="num">${referral.length}</td><td class="num">${inr(referralTotal)}</td></tr>
  </tbody>
</table>

<h3>Transaction ledger</h3>
<table>
  <thead>
    <tr>
      <th>Payout ID</th><th>Date</th><th>Credited to</th><th>Referred member</th><th class="num">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${referralRowsHtml}
    <tr class="total"><td colspan="4">Referral bonus total</td><td class="num">${inr(referralTotal)}</td></tr>
  </tbody>
</table>

<h2>3. Joining bonus <span class="badge rec">Recorded</span></h2>
<p class="section-intro">
  5% of the activation package credited to the direct upline on activation approval.
  ${joining.length} transactions totalling <strong>${inr(joiningTotal)}</strong>.
</p>
<table class="avoid-break">
  <thead>
    <tr>
      <th>Payout ID</th><th>Date</th><th>Credited to</th><th>New member</th><th class="num">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${joiningRowsHtml}
    <tr class="total"><td colspan="4">Joining bonus total</td><td class="num">${inr(joiningTotal)}</td></tr>
  </tbody>
</table>

<h2>4. Level bonus <span class="badge comp">Computed</span></h2>
<p class="section-intro">
  21-level pool (9.15% combined) calculated on downline investments, using the same
  logic as the dashboard (${CUTOFF_LABEL} snapshot; all investments and members predate the cutoff).
  Total <strong>${inr(levelBonusTotal)}</strong> across ${levelPerUser.length} beneficiaries.
</p>

<h3>By level</h3>
<table class="avoid-break">
  <thead>
    <tr><th class="num">Level</th><th class="num">Rate</th><th class="num">Beneficiaries</th><th class="num">Bonus</th></tr>
  </thead>
  <tbody>
    ${levelDistRowsHtml}
    <tr class="total"><td colspan="3">Level bonus total</td><td class="num">${inr(levelBonusTotal)}</td></tr>
  </tbody>
</table>

<h3>By beneficiary</h3>
<table>
  <thead>
    <tr><th>Member</th><th class="num">Active levels</th><th class="num">Level bonus</th></tr>
  </thead>
  <tbody>
    ${levelUserRowsHtml}
    <tr class="total"><td colspan="2">Level bonus total</td><td class="num">${inr(levelBonusTotal)}</td></tr>
  </tbody>
</table>

<h2>5. Fixed salary <span class="badge ${salaryRows.length ? "comp" : "nil"}">${salaryRows.length ? "Computed" : "Not applicable"}</span></h2>
<p class="section-intro">
  Monthly salary tiers start at ${inr(SALARY_TIERS[0]!.totalBusiness)} total team business.
  Highest team business as of ${CUTOFF_LABEL}: <strong>${inr(highestBusiness.business)}</strong>
  (${esc(highestBusiness.name)}).
</p>
<table class="avoid-break">
  <thead>
    <tr><th>Member</th><th class="num">Team business</th><th class="num">Salary</th></tr>
  </thead>
  <tbody>${salaryBodyHtml}</tbody>
</table>

<h2>6. ROI / capital return <span class="badge nil">Not credited</span></h2>
<p class="section-intro">
  Investment plans promise 5% capital return + 5–8% monthly ROI
  (200%–260% total returns), but no ROI credit entries exist in the
  payout ledger till ${CUTOFF_LABEL}. Recorded: <strong>${inr(0)}</strong>.
</p>

<h2>Notes &amp; method</h2>
<ul class="notes">
  <li><strong>Recorded</strong> figures come from the <span class="mono">payouts</span> ledger (all entries dated ≤ 30 Oct 2026; no entries exist after the cutoff, so the cutoff excludes nothing).</li>
  <li><strong>Computed</strong> figures are derived with the application's own rules
      (<span class="mono">src/lib/store.ts</span>: <span class="mono">calculateLevelBonus</span>,
      <span class="mono">calculateSalary</span>) on the member tree as of the cutoff.</li>
  <li>Level bonus sums each ancestor's entitled percentage on every downline investment — the same way the dashboard presents it; it is not yet posted to the payout ledger.</li>
  <li>Joining Reward Wallet balances (${inr(walletBalance)}) mirror the joining-bonus payouts and are not counted twice.</li>
  <li>Direct referral bonuses of ${inr(referralTotal)} + joining bonuses of ${inr(joiningTotal)} = <strong>${inr(recordedTotal)}</strong> have actually been credited to member ledgers/balances.</li>
</ul>

<footer>
  Tradebee income report · period inception → ${CUTOFF_LABEL} · generated from live database snapshot ·
  questions: admin@tradebee
</footer>

</body>
</html>`;

const outHtml = resolve(import.meta.dirname, "..", "public", "reports", "income-report-2026-10-30.html");
const fs = await import("fs");
fs.mkdirSync(resolve(import.meta.dirname, "..", "public", "reports"), { recursive: true });
fs.writeFileSync(outHtml, html, "utf8");
console.log("HTML written:", outHtml);

// console summary for verification
console.log("\n== REPORT NUMBERS ==");
console.log({
  referral: { count: referral.length, total: referralTotal },
  joining: { count: joining.length, total: joiningTotal },
  recordedTotal,
  levelBonus: { beneficiaries: levelPerUser.length, total: levelBonusTotal },
  salary: { qualifiers: salaryRows.length, total: salaryRows.reduce((s, r) => s + r.salary, 0) },
  highestBusiness,
  grandTotal,
  monthly: monthlyRows,
});
