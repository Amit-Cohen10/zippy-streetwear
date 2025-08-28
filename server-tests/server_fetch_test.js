/* Simple Node fetch tests for your server (non-intrusive) */
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';
const fetch =
  global.fetch ||
  ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

function getSetCookieHeaders(headers) {
  try {
    if (typeof headers.getSetCookie === 'function') {
      return headers.getSetCookie();
    }
  } catch (_) {}
  try {
    if (typeof headers.raw === 'function') {
      return headers.raw()['set-cookie'] || [];
    }
  } catch (_) {}
  const single = headers.get && headers.get('set-cookie');
  return single ? [single] : [];
}

async function getJSON(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  try {
    return { res, data: JSON.parse(text) };
  } catch {
    return { res, data: text };
  }
}

(async () => {
  try {
    console.log(`Base URL: ${BASE}`);

    // 1) Public endpoint
    const { res: prodRes, data: prodData } = await getJSON(
      '/api/products?limit=3&page=1'
    );
    console.log('GET /api/products status:', prodRes.status);
    const sampleCount = Array.isArray(prodData)
      ? prodData.length
      : prodData?.items?.length || 0;
    console.log('Products sample count:', sampleCount);

    // 2) Register new user (unique username)
    const username = `test${Math.random().toString(36).slice(2, 8)}`;
    const email = `${username}@example.com`;
    const password = 'Passw0rd!';
    const reg = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    console.log('POST /api/auth/register status:', reg.status);

    const setCookies = getSetCookieHeaders(reg.headers);
    const cookieHeader = setCookies.length ? setCookies.join('; ') : '';

    // 3) Authenticated profile using cookie
    const prof = await fetch(`${BASE}/api/auth/profile`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {}
    });
    console.log('GET /api/auth/profile status:', prof.status);
    const profData = await prof.json().catch(() => ({}));
    console.log('Profile user id:', profData?.user?.id || 'N/A');

    // 4) Protected sample (orders)
    const orders = await fetch(
      `${BASE}/api/payment/orders?limit=1&page=1`,
      { headers: cookieHeader ? { Cookie: cookieHeader } : {} }
    );
    console.log('GET /api/payment/orders status:', orders.status);

    process.exit(0);
  } catch (e) {
    console.error('Fetch test error:', e);
    process.exit(1);
  }
})();


