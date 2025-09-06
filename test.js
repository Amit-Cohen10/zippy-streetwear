// Real HTTP test suite for the server using fetch
const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';
const fetch = global.fetch || ((...a) => import('node-fetch').then(({ default: f }) => f(...a)));

function getSetCookie(headers) {
  try { if (typeof headers.getSetCookie === 'function') return headers.getSetCookie(); } catch (_) {}
  try { if (typeof headers.raw === 'function') return headers.raw()['set-cookie'] || []; } catch (_) {}
  const single = headers.get && headers.get('set-cookie');
  return single ? [single] : [];
}

async function j(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { res, data };
}

function okOrThrow(res, name) { if (!res.ok) throw new Error(`${name} status ${res.status}`); }

(async () => {
  try {
    console.log(`Base URL: ${BASE}`);

    // 1) Public products endpoint should work (products page is public)
    let { res: pRes, data: pData } = await j('/api/products?limit=2&page=1');
    okOrThrow(pRes, 'GET /api/products');
    console.log('✅ GET /api/products');

    // 2) Register a new user and capture cookie
    const username = `u${Math.random().toString(36).slice(2, 8)}`;
    const email = `${username}@example.com`;
    const password = 'Passw0rd!';
    const reg = await fetch(`${BASE}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    okOrThrow(reg, 'POST /api/auth/register');
    console.log('✅ POST /api/auth/register');
    const cookie = getSetCookie(reg.headers).join('; ');

    // 3) Profile with cookie
    const prof = await fetch(`${BASE}/api/auth/profile`, { headers: cookie ? { Cookie: cookie } : {} });
    okOrThrow(prof, 'GET /api/auth/profile');
    console.log('✅ GET /api/auth/profile');

    // 4) Choose a product and add to cart
    ({ res: pRes, data: pData } = await j('/api/products?limit=1&page=1'));
    okOrThrow(pRes, 'GET /api/products (for cart)');
    const prod = (pData.products || [])[0];
    if (!prod) throw new Error('No product available');
    const size = (prod.sizes || [])[0] || 'M';
    const add = await fetch(`${BASE}/api/cart/add`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify({ productId: prod.id, size, quantity: 1 })
    });
    okOrThrow(add, 'POST /api/cart/add');
    console.log('✅ POST /api/cart/add');

    // 5) Checkout (mock payment)
    const chk = await fetch(`${BASE}/api/payment/checkout`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: JSON.stringify({
        shippingAddress: { city: 'Tel Aviv', address: 'A', zip: '12345' },
        paymentMethod: 'card', cardNumber: '4111111111111111', expiryDate: '12/30', cvv: '123'
      })
    });
    okOrThrow(chk, 'POST /api/payment/checkout');
    console.log('✅ POST /api/payment/checkout');

    // 6) Orders fetch
    const orders = await fetch(`${BASE}/api/payment/orders?limit=1&page=1`, { headers: cookie ? { Cookie: cookie } : {} });
    okOrThrow(orders, 'GET /api/payment/orders');
    console.log('✅ GET /api/payment/orders');

    console.log('🎉 Tests completed successfully');
    process.exit(0);
  } catch (e) {
    console.error('❌ Test failure:', e.message || e);
    process.exit(1);
  }
})();