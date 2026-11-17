import { APP_BASE_URL } from '../src/config/env.js';

const BASE_URL = APP_BASE_URL || 'http://localhost:3000';

// Optional verified student test credentials (supplied via environment variables when testing lifecycle)
const OWNER_EMAIL = process.env.TEST_OWNER_EMAIL || '';
const BORROWER_EMAIL = process.env.TEST_BORROWER_EMAIL || '';
const USER_PASSWORD = process.env.TEST_USER_PASSWORD || '';

const results = [];

function recordStep(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const mark = passed ? '[PASS]' : '[FAIL]';
  console.log(`${mark} | ${name}${detail ? ` (${detail})` : ''}`);
}

async function run() {
  console.log(`\nRunning lendNborrow API Verification against: ${BASE_URL}\n`);

  // Step 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.status === 200 && data.ok) {
      recordStep('Server Health Check', true, 'Supabase connected');
    } else {
      recordStep('Server Health Check', false, `Status ${res.status}: ${JSON.stringify(data)}`);
      console.log('\nServer reported Supabase is not configured. Aborting live database checks.');
      return;
    }
  } catch (err) {
    recordStep('Server Health Check', false, err.message);
    console.log('\nCould not reach server at ' + BASE_URL + '. Ensure the server is running.');
    return;
  }

  // Step 2: GSuite Domain Restriction Check (Non-BatStateU Email Rejection)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'external.user@gmail.com',
        password: 'password123',
        full_name: 'External User',
        student_number: '21-99999',
        college: 'CICS'
      })
    });
    const data = await res.json();
    if (res.status === 400 && data.error?.includes('BatStateU GSuite')) {
      recordStep('Institutional Email Domain Enforcement', true, 'Rejected non-domain email');
    } else {
      recordStep('Institutional Email Domain Enforcement', false, `Status ${res.status}: ${data.error}`);
    }
  } catch (err) {
    recordStep('Institutional Email Domain Enforcement', false, err.message);
  }

  // Step 3: Live Catalog Endpoint (handles empty or populated state cleanly)
  try {
    const res = await fetch(`${BASE_URL}/api/items`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.items) && typeof data.pagination?.total === 'number') {
      recordStep('Catalog Browse Endpoint', true, `Returned ${data.items.length} items (total: ${data.pagination.total})`);
    } else {
      recordStep('Catalog Browse Endpoint', false, `Unexpected payload: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordStep('Catalog Browse Endpoint', false, err.message);
  }

  // Step 4: Community Analytics Endpoint (verifies 2-chart schema without trendingItems)
  try {
    const res = await fetch(`${BASE_URL}/api/analytics/community`);
    const data = await res.json();
    const validStructure =
      res.status === 200 &&
      Array.isArray(data.topCategories) &&
      Array.isArray(data.collegeActivity) &&
      !('trendingItems' in data);

    if (validStructure) {
      recordStep(
        'Community Analytics Endpoint',
        true,
        `Categories: ${data.topCategories.length}, Colleges: ${data.collegeActivity.length}`
      );
    } else {
      recordStep('Community Analytics Endpoint', false, `Unexpected schema: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    recordStep('Community Analytics Endpoint', false, err.message);
  }

  // Step 5+: Optional Authenticated Lifecycle Verification (if test credentials are set)
  if (OWNER_EMAIL && BORROWER_EMAIL && USER_PASSWORD) {
    let ownerCookie = '';
    let borrowerCookie = '';
    let testItemId = null;
    let testRequestId = null;

    async function performLogin(email, pwd) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      const rawCookies = res.headers.get('set-cookie');
      let cookie = '';
      if (rawCookies) {
        const match = rawCookies.match(/access_token=[^;]+/);
        if (match) cookie = match[0];
      }
      return { data, cookie };
    }

    try {
      const login1 = await performLogin(OWNER_EMAIL, USER_PASSWORD);
      ownerCookie = login1.cookie;
      recordStep('Sign in Owner Account', true, login1.data.user?.email);

      const login2 = await performLogin(BORROWER_EMAIL, USER_PASSWORD);
      borrowerCookie = login2.cookie;
      recordStep('Sign in Borrower Account', true, login2.data.user?.email);

      // Create item
      const createRes = await fetch(`${BASE_URL}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: ownerCookie },
        body: JSON.stringify({
          title: 'Verification Scientific Calculator',
          description: 'Temporary verification listing.',
          category: 'Academic & Engineering',
          condition: 'Good',
          pickup_location: 'CICS Building',
          max_borrow_days: 7
        })
      });
      const createData = await createRes.json();
      if (createRes.status === 201 && createData.item?.id) {
        testItemId = createData.item.id;
        recordStep('Create Listing', true, `Item ID: ${testItemId}`);
      } else {
        recordStep('Create Listing', false, createData.error || 'Failed');
      }

      if (testItemId) {
        const today = new Date();
        const startDate = today.toISOString().split('T')[0];
        const dueDate = new Date(today.getTime() + 2 * 86400000).toISOString().split('T')[0];

        const reqRes = await fetch(`${BASE_URL}/api/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: borrowerCookie },
          body: JSON.stringify({
            item_id: testItemId,
            start_date: startDate,
            due_date: dueDate,
            message: 'Verification request'
          })
        });
        const reqData = await reqRes.json();
        if (reqRes.status === 201 && reqData.request?.id) {
          testRequestId = reqData.request.id;
          recordStep('Submit Borrow Request', true, `Request ID: ${testRequestId}`);
        } else {
          recordStep('Submit Borrow Request', false, reqData.error || 'Failed');
        }
      }

      if (testRequestId) {
        const appRes = await fetch(`${BASE_URL}/api/requests/${testRequestId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: ownerCookie }
        });
        recordStep('Approve Request', appRes.ok);

        const pickRes = await fetch(`${BASE_URL}/api/requests/${testRequestId}/pickup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: ownerCookie }
        });
        recordStep('Confirm Pickup', pickRes.ok);

        const retRes = await fetch(`${BASE_URL}/api/requests/${testRequestId}/return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: borrowerCookie },
          body: JSON.stringify({ condition_note: 'Returned in good order' })
        });
        recordStep('Submit Return', retRes.ok);

        const confRes = await fetch(`${BASE_URL}/api/requests/${testRequestId}/confirm-return`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: ownerCookie },
          body: JSON.stringify({ condition: 'Good' })
        });
        recordStep('Confirm Return', confRes.ok);
      }

      if (testItemId) {
        const delRes = await fetch(`${BASE_URL}/api/items/${testItemId}`, {
          method: 'DELETE',
          headers: { Cookie: ownerCookie }
        });
        recordStep('Delete Temporary Listing', delRes.ok);
      }
    } catch (err) {
      recordStep('Authenticated Lifecycle Check', false, err.message);
    }
  } else {
    console.log('\nNote: Set TEST_OWNER_EMAIL, TEST_BORROWER_EMAIL, and TEST_USER_PASSWORD to run authenticated lifecycle steps.');
  }

  console.log('\n==================================================');
  console.log('            VERIFICATION SUMMARY                  ');
  console.log('==================================================');
  const allPassed = results.every(r => r.passed);
  results.forEach(r => {
    console.log(`${r.passed ? '[PASS]' : '[FAIL]'} ${r.name}`);
  });
  console.log('==================================================');
  console.log(`Final Result: ${allPassed ? 'ALL CHECKS PASSED' : 'SOME CHECKS FAILED'}\n`);
}

run();
