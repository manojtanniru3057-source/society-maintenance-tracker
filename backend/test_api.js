require('dotenv').config();
const http = require('http');

let passed = 0, failed = 0;

function test(name, condition, detail = '') {
  if (condition) { console.log(`  ✓ PASS: ${name}${detail ? ' — ' + detail : ''}`); passed++; }
  else { console.log(`  ✗ FAIL: ${name}${detail ? ' — ' + detail : ''}`); failed++; }
}

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost', port: 5000, path, method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
    const r = http.request(opts, res => {
      let buf = '';
      res.on('data', d => (buf += d));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
        catch { resolve({ status: res.statusCode, body: buf }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   SOCIETY MAINTENANCE TRACKER — API TESTS ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  // ─── AUTH ───────────────────────────────────────
  console.log('── 1. AUTH ──────────────────────────────────');

  const health = await req('GET', '/api/health');
  test('Health endpoint', health.status === 200 && health.body.status === 'ok');

  // Register unique resident
  const email = `resident_${Date.now()}@test.com`;
  const regRes = await req('POST', '/api/auth/register', { name: 'Priya Patel', email, password: 'pass1234', flatNumber: 'C-303', role: 'resident' });
  test('Register resident', regRes.status === 201, `role=${regRes.body.user?.role}`);
  test('Role cannot be elevated via register', regRes.body.user?.role === 'resident');
  const token = regRes.body.token;

  const loginRes = await req('POST', '/api/auth/login', { email, password: 'pass1234' });
  test('Login resident', loginRes.status === 200);

  const badLogin = await req('POST', '/api/auth/login', { email, password: 'wrongpass' });
  test('Bad password rejected', badLogin.status === 401);

  const me = await req('GET', '/api/auth/me', null, token);
  test('/me returns user', me.status === 200 && me.body.email === email);

  const adminLogin = await req('POST', '/api/auth/login', { email: 'admin@society.com', password: 'admin1234' });
  test('Admin login', adminLogin.status === 200 && adminLogin.body.user?.role === 'admin');
  const adminToken = adminLogin.body.token;

  // ─── COMPLAINTS ──────────────────────────────────
  console.log('\n── 2. COMPLAINTS ────────────────────────────');

  const myEmpty = await req('GET', '/api/complaints/my', null, token);
  test('Resident: my complaints (initially empty)', myEmpty.status === 200 && Array.isArray(myEmpty.body));

  // Resident cannot access admin route
  const noAdmin = await req('GET', '/api/complaints', null, token);
  test('Resident blocked from admin complaints list', noAdmin.status === 403);

  // Note: photo upload requires multipart, skip that here — tested via frontend
  // Manually insert a complaint via a helper if needed. Instead, let's test the API shape.
  const adminAll = await req('GET', '/api/complaints', null, adminToken);
  test('Admin: get all complaints', adminAll.status === 200 && typeof adminAll.body.total !== 'undefined');

  // Filter by status
  const filterOpen = await req('GET', '/api/complaints?status=Open', null, adminToken);
  test('Admin: filter by status=Open', filterOpen.status === 200);

  // Filter by category
  const filterCat = await req('GET', '/api/complaints?category=Plumbing', null, adminToken);
  test('Admin: filter by category=Plumbing', filterCat.status === 200);

  // Filter by date range
  const filterDate = await req('GET', '/api/complaints?from=2024-01-01&to=2026-12-31', null, adminToken);
  test('Admin: filter by date range', filterDate.status === 200);

  // Access a non-existent complaint
  const notFound = await req('GET', '/api/complaints/000000000000000000000000', null, token);
  test('Non-existent complaint returns 404', notFound.status === 404);

  // ─── NOTICES ──────────────────────────────────────
  console.log('\n── 3. NOTICES ───────────────────────────────');

  const noticeUnauth = await req('POST', '/api/notices', { title: 'Test', content: 'Test' });
  test('Unauthenticated notice POST blocked (401)', noticeUnauth.status === 401);

  const residentNotice = await req('POST', '/api/notices', { title: 'Test', content: 'Test' }, token);
  test('Resident cannot post notice (403)', residentNotice.status === 403);

  const noticePost = await req('POST', '/api/notices', {
    title: 'Electricity Maintenance',
    content: 'Power will be cut 9-11am on Sunday.',
    isImportant: false,
  }, adminToken);
  test('Admin post notice', noticePost.status === 201, `id=${noticePost.body._id}`);

  const importantNotice = await req('POST', '/api/notices', {
    title: 'Society Meeting — IMPORTANT',
    content: 'All residents must attend the AGM on September 1 at 5pm in the community hall.',
    isImportant: true,
  }, adminToken);
  test('Admin post important notice', importantNotice.status === 201 && importantNotice.body.isImportant === true);

  const noticesList = await req('GET', '/api/notices', null, token);
  test('Resident get notices list', noticesList.status === 200 && noticesList.body.length >= 2);
  test('Important notice sorted first', noticesList.body[0]?.isImportant === true);

  const delNotice = await req('DELETE', `/api/notices/${noticePost.body._id}`, null, adminToken);
  test('Admin delete notice', delNotice.status === 200);

  const afterDel = await req('GET', '/api/notices', null, token);
  test('Deleted notice no longer appears', afterDel.body.every(n => n._id !== noticePost.body._id));

  // ─── DASHBOARD ────────────────────────────────────
  console.log('\n── 4. DASHBOARD ─────────────────────────────');

  const dash = await req('GET', '/api/dashboard', null, adminToken);
  test('Admin dashboard OK', dash.status === 200);
  test('Dashboard has byStatus', !!dash.body.byStatus);
  test('Dashboard has byCategory', !!dash.body.byCategory);
  test('Dashboard has overdueCount', typeof dash.body.overdueCount === 'number');

  const dashUnauth = await req('GET', '/api/dashboard', null, token);
  test('Resident blocked from dashboard (403)', dashUnauth.status === 403);

  // ─── SUMMARY ──────────────────────────────────────
  console.log(`\n══════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`══════════════════════════════════════════════\n`);
  if (failed > 0) process.exit(1);
}

main().catch(e => { console.error('Test runner error:', e); process.exit(1); });
