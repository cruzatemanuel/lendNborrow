import {
  APP_BASE_URL,
  SEED_DEMO_PASSWORD
} from '../src/config/env.js';

const BASE_URL = APP_BASE_URL || 'http://localhost:3000';

const USER1_EMAIL = 'demo1@g.batstate-u.edu.ph';
const USER2_EMAIL = 'demo2@g.batstate-u.edu.ph';
const PASSWORD = SEED_DEMO_PASSWORD || 'CHANGE_ME_DEMO_PASSWORD';

let user1Cookie = null;
let user2Cookie = null;
let testItemId = null;
let testRequestId = null;

const results = [];

function recordStep(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const mark = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${mark} | ${name}${detail ? ` (${detail})` : ''}`);
}

async function run() {
  console.log(`\n🧪 Running lendNborrow Smoke Test against: ${BASE_URL}\n`);

  // Step 1: Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (res.status === 200 && data.ok) {
      recordStep('Server Health Check', true, 'Supabase connected');
    } else {
      recordStep('Server Health Check', false, `Status ${res.status}: ${JSON.stringify(data)}`);
      console.log('\n⚠️ Server reported Supabase is not configured. Aborting live test.');
      return;
    }
  } catch (err) {
    recordStep('Server Health Check', false, err.message);
    console.log('\n⚠️ Could not reach server at ' + BASE_URL + '. Is it running?');
    return;
  }

  // Step 2: GSuite Domain Restriction Check (Intruder Email Rejection)
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'intruder@gmail.com',
        password: 'password123',
        full_name: 'Outsider',
        student_number: '00-00000',
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

  // Helper for login and cookie extraction
  async function performLogin(email, pwd) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    // Extract Set-Cookie header
    const rawCookies = res.headers.get('set-cookie');
    let cookie = '';
    if (rawCookies) {
      const match = rawCookies.match(/access_token=[^;]+/);
      if (match) cookie = match[0];
    }
    return { data, cookie };
  }

  // Step 3: Log in as User 1 (Owner)
  try {
    const login1 = await performLogin(USER1_EMAIL, PASSWORD);
    user1Cookie = login1.cookie;
    recordStep('Sign in Demo User 1 (Owner)', true, login1.data.user?.full_name);
  } catch (err) {
    recordStep('Sign in Demo User 1 (Owner)', false, err.message);
    return;
  }

  // Step 4: Log in as User 2 (Borrower)
  try {
    const login2 = await performLogin(USER2_EMAIL, PASSWORD);
    user2Cookie = login2.cookie;
    recordStep('Sign in Demo User 2 (Borrower)', true, login2.data.user?.full_name);
  } catch (err) {
    recordStep('Sign in Demo User 2 (Borrower)', false, err.message);
    return;
  }

  // Step 5: User 1 lists an item
  try {
    // We send multipart or urlencoded/json for item creation
    // The endpoint supports express.json or multer.
    const res = await fetch(`${BASE_URL}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user1Cookie
      },
      body: JSON.stringify({
        title: 'Smoke Test Scientific Calculator',
        description: 'Temporary listing generated during smoke test verification.',
        category: 'Academic & Engineering',
        condition: 'Like New',
        pickup_location: 'CICS Lobby Alangilan',
        max_borrow_days: 7
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.item?.id) {
      testItemId = data.item.id;
      recordStep('Create Listing (User 1)', true, `Item ID: ${testItemId}`);
    } else {
      recordStep('Create Listing (User 1)', false, data.error || 'Failed to create item');
      return;
    }
  } catch (err) {
    recordStep('Create Listing (User 1)', false, err.message);
    return;
  }

  // Step 6: User 2 requests to borrow the item
  try {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const dueDate = new Date(today.getTime() + 3 * 86400000).toISOString().split('T')[0];

    const res = await fetch(`${BASE_URL}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user2Cookie
      },
      body: JSON.stringify({
        item_id: testItemId,
        start_date: startDate,
        due_date: dueDate,
        message: 'Smoke test borrow request.'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.request?.id) {
      testRequestId = data.request.id;
      recordStep('Submit Borrow Request (User 2)', true, `Request ID: ${testRequestId}`);
    } else {
      recordStep('Submit Borrow Request (User 2)', false, data.error || 'Failed to create request');
      return;
    }
  } catch (err) {
    recordStep('Submit Borrow Request (User 2)', false, err.message);
    return;
  }

  // Step 7: User 1 approves request
  try {
    const res = await fetch(`${BASE_URL}/api/requests/${testRequestId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user1Cookie
      }
    });
    const data = await res.json();
    if (res.ok) {
      recordStep('Approve Request (User 1)', true, 'Status transitioned to approved');
    } else {
      recordStep('Approve Request (User 1)', false, data.error);
    }
  } catch (err) {
    recordStep('Approve Request (User 1)', false, err.message);
  }

  // Step 8: User 1 confirms pickup / handover
  try {
    const res = await fetch(`${BASE_URL}/api/requests/${testRequestId}/pickup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user1Cookie
      }
    });
    const data = await res.json();
    if (res.ok) {
      recordStep('Confirm Pickup (User 1)', true, 'Status transitioned to borrowing; item borrowed');
    } else {
      recordStep('Confirm Pickup (User 1)', false, data.error);
    }
  } catch (err) {
    recordStep('Confirm Pickup (User 1)', false, err.message);
  }

  // Step 9: User 2 submits return
  try {
    const res = await fetch(`${BASE_URL}/api/requests/${testRequestId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user2Cookie
      },
      body: JSON.stringify({ condition_note: 'Returned intact.' })
    });
    const data = await res.json();
    if (res.ok) {
      recordStep('Submit Return (User 2)', true, 'Status transitioned to return_submitted');
    } else {
      recordStep('Submit Return (User 2)', false, data.error);
    }
  } catch (err) {
    recordStep('Submit Return (User 2)', false, err.message);
  }

  // Step 10: User 1 confirms return
  try {
    const res = await fetch(`${BASE_URL}/api/requests/${testRequestId}/confirm-return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': user1Cookie
      },
      body: JSON.stringify({ condition: 'Like New' })
    });
    const data = await res.json();
    if (res.ok) {
      recordStep('Confirm Return (User 1)', true, 'Status returned; item available again');
    } else {
      recordStep('Confirm Return (User 1)', false, data.error);
    }
  } catch (err) {
    recordStep('Confirm Return (User 1)', false, err.message);
  }

  // Step 11: Verify item is back to available
  try {
    const res = await fetch(`${BASE_URL}/api/items/${testItemId}`);
    const data = await res.json();
    if (res.ok && data.item?.status === 'available') {
      recordStep('Verify Item Available Post-Return', true, 'Item status is available');
    } else {
      recordStep('Verify Item Available Post-Return', false, `Status: ${data.item?.status}`);
    }
  } catch (err) {
    recordStep('Verify Item Available Post-Return', false, err.message);
  }

  // Step 12: Clean up test item
  try {
    const res = await fetch(`${BASE_URL}/api/items/${testItemId}`, {
      method: 'DELETE',
      headers: { 'Cookie': user1Cookie }
    });
    if (res.ok) {
      recordStep('Cleanup Test Item', true, 'Deleted test listing');
    } else {
      recordStep('Cleanup Test Item', false);
    }
  } catch (err) {
    recordStep('Cleanup Test Item', false, err.message);
  }

  // Print Summary Table
  console.log('\n==================================================');
  console.log('            SMOKE TEST SUMMARY RESULTS            ');
  console.log('==================================================');
  const allPassed = results.every(r => r.passed);
  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'}  ${r.name}`);
  });
  console.log('==================================================');
  console.log(`Final Result: ${allPassed ? 'ALL TESTS PASSED 🎉' : 'SOME TESTS FAILED ⚠️'}\n`);
}

run();

