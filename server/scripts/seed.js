import {
  isSupabaseConfigured,
  SEED_DEMO_PASSWORD,
  SUPABASE_STORAGE_BUCKET
} from '../src/config/env.js';
import { supabaseAdmin } from '../src/services/supabase.js';

if (!isSupabaseConfigured || !supabaseAdmin) {
  console.error('\n❌ Cannot run seed script: Supabase credentials are not configured in server/.env.');
  console.error('   Please provide SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.\n');
  process.exit(1);
}

const DEMO_USERS = [
  {
    email: 'demo1@g.batstate-u.edu.ph',
    password: SEED_DEMO_PASSWORD,
    full_name: 'Juan Dela Cruz',
    student_number: '21-00101',
    college: 'CICS',
    campus: 'Alangilan',
    contact: '09171112233'
  },
  {
    email: 'demo2@g.batstate-u.edu.ph',
    password: SEED_DEMO_PASSWORD,
    full_name: 'Maria Santos',
    student_number: '21-00202',
    college: 'CEAFA',
    campus: 'Alangilan',
    contact: '09183334455'
  },
  {
    email: 'demo3@g.batstate-u.edu.ph',
    password: SEED_DEMO_PASSWORD,
    full_name: 'Paolo Reyes',
    student_number: '21-00303',
    college: 'CIT',
    campus: 'Alangilan',
    contact: '09195556677'
  }
];

async function seed() {
  console.log('\n🌱 Starting lendNborrow Database Seed...');

  const createdUserMap = {};

  // 1. Create or retrieve demo Auth users
  for (const user of DEMO_USERS) {
    console.log(` → Provisioning demo user: ${user.email}`);

    // Check if user already exists
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    let authUser = (listData?.users || []).find(u => u.email === user.email);

    if (!authUser) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          student_number: user.student_number,
          college: user.college,
          campus: user.campus
        }
      });

      if (createErr) {
        console.error(`   Failed to create auth user ${user.email}:`, createErr.message);
        continue;
      }
      authUser = created.user;
    } else {
      // Ensure password and confirmation are set
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: user.password,
        email_confirm: true
      });
    }

    createdUserMap[user.email] = authUser.id;

    // Upsert Profile
    await supabaseAdmin.from('profiles').upsert({
      id: authUser.id,
      email: user.email,
      full_name: user.full_name,
      student_number: user.student_number,
      college: user.college,
      campus: user.campus,
      contact: user.contact,
      verification_status: 'active',
      updated_at: new Date().toISOString()
    });
  }

  const u1 = createdUserMap['demo1@g.batstate-u.edu.ph'];
  const u2 = createdUserMap['demo2@g.batstate-u.edu.ph'];
  const u3 = createdUserMap['demo3@g.batstate-u.edu.ph'];

  if (!u1 || !u2 || !u3) {
    console.error('❌ Could not provision all demo users.');
    process.exit(1);
  }

  // 2. Sample Items across colleges and categories
  console.log('\n → Seeding sample catalog items...');

  const SAMPLE_ITEMS = [
    {
      owner_id: u1,
      title: 'Texas Instruments TI-84 Plus CE Graphing Calculator',
      description: 'Used for Advanced Calculus and Linear Algebra. Includes charging cable and slide case.',
      category: 'Academic & Engineering',
      condition: 'Like New',
      pickup_location: 'CICS 3rd Floor Faculty Lounge',
      max_borrow_days: 14,
      status: 'available'
    },
    {
      owner_id: u1,
      title: 'Arduino Uno R3 Starter Kit with Sensors',
      description: 'Full microcontroller kit with breadboard, ultrasonic sensor, jumper wires, and LEDs for Embedded Systems.',
      category: 'Electronics & Gadgets',
      condition: 'Good',
      pickup_location: 'CICS Hardware Lab Room 204',
      max_borrow_days: 7,
      status: 'available'
    },
    {
      owner_id: u2,
      title: 'Rotring Technical Drafting Pen Set & T-Square',
      description: 'Isograph technical pens (0.2, 0.3, 0.5) with standard drafting ruler and 24-inch wooden T-square.',
      category: 'Academic & Engineering',
      condition: 'Good',
      pickup_location: 'CEAFA Architecture Drafting Studio',
      max_borrow_days: 5,
      status: 'available'
    },
    {
      owner_id: u2,
      title: 'Anker USB-C Hub Multi-port 8-in-1 Adapter',
      description: 'Supports 4K HDMI, Gigabit Ethernet, SD card reader, and 100W PD pass-through. Essential for laptops without ports.',
      category: 'Electronics & Gadgets',
      condition: 'Like New',
      pickup_location: 'CEAFA Ground Floor Student Lounge',
      max_borrow_days: 3,
      status: 'available'
    },
    {
      owner_id: u3,
      title: 'Digital Multimeter & Electronic Soldering Station 60W',
      description: 'Auto-ranging multimeter with test leads, temperature-controlled soldering iron, solder wire, and stand.',
      category: 'Lab & Workshop',
      condition: 'Good',
      pickup_location: 'CIT Electronics Workshop Bldg B',
      max_borrow_days: 4,
      status: 'available'
    },
    {
      owner_id: u3,
      title: 'Stainless Steel Digital Vernier Caliper (150mm)',
      description: 'High precision 0.01mm resolution caliper with LCD screen, inch/metric conversion, and protective hard case.',
      category: 'Lab & Workshop',
      condition: 'Like New',
      pickup_location: 'CIT Mechanical Tech Lab',
      max_borrow_days: 5,
      status: 'available'
    },
    {
      owner_id: u1,
      title: 'Introduction to Algorithms (CLRS 3rd Edition)',
      description: 'Comprehensive computer science textbook covering sorting, graph algorithms, dynamic programming, and complexity.',
      category: 'Books & Reviewers',
      condition: 'Good',
      pickup_location: 'BatStateU Alangilan Main Library',
      max_borrow_days: 14,
      status: 'available'
    },
    {
      owner_id: u2,
      title: 'Fluid Mechanics & Engineering Thermodynamics Reviewer',
      description: 'Spiral-bound engineering board exam reviewer containing worked sample problems and reference equations.',
      category: 'Books & Reviewers',
      condition: 'Fair',
      pickup_location: 'CEAFA Engineering Library',
      max_borrow_days: 10,
      status: 'available'
    },
    {
      owner_id: u3,
      title: 'Logitech Wireless Presentation Clicker with Red Laser',
      description: 'Wireless presenter remote for thesis presentations and classroom project pitches. 15-meter range.',
      category: 'Other',
      condition: 'Like New',
      pickup_location: 'CIT Audio-Visual Room',
      max_borrow_days: 2,
      status: 'available'
    }
  ];

  const createdItems = [];
  for (const item of SAMPLE_ITEMS) {
    const { data: itemData, error: itemErr } = await supabaseAdmin
      .from('items')
      .insert(item)
      .select()
      .single();

    if (!itemErr && itemData) {
      createdItems.push(itemData);
    }
  }

  console.log(`   Seeded ${createdItems.length} items across 5 categories.`);

  // 3. Sample Requests across statuses for analytics
  if (createdItems.length >= 4) {
    console.log('\n → Seeding sample borrow requests in diverse lifecycle statuses...');

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const pastDate = new Date(now.getTime() - 5 * 86400000).toISOString().split('T')[0];
    const futureDate = new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0];

    // Request 1: Returned (Completed)
    await supabaseAdmin.from('borrow_requests').insert({
      item_id: createdItems[0].id,
      borrower_id: u2,
      owner_id: u1,
      status: 'returned',
      start_date: pastDate,
      due_date: today,
      picked_up_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
      returned_at: now.toISOString(),
      return_condition: 'Like New',
      message: 'Need calculator for calculus midterm exam.'
    });

    // Request 2: Active Borrowing
    await supabaseAdmin.from('borrow_requests').insert({
      item_id: createdItems[1].id,
      borrower_id: u3,
      owner_id: u1,
      status: 'borrowing',
      start_date: today,
      due_date: futureDate,
      picked_up_at: now.toISOString(),
      message: 'Borrowing for laboratory project prototype.'
    });
    // Mark item borrowed
    await supabaseAdmin.from('items').update({ status: 'borrowed' }).eq('id', createdItems[1].id);

    // Request 3: Pending
    await supabaseAdmin.from('borrow_requests').insert({
      item_id: createdItems[2].id,
      borrower_id: u1,
      owner_id: u2,
      status: 'pending',
      start_date: today,
      due_date: futureDate,
      message: 'Need T-square for plate submission this Friday.'
    });

    // Request 4: Return Submitted (pending owner confirmation)
    await supabaseAdmin.from('borrow_requests').insert({
      item_id: createdItems[4].id,
      borrower_id: u2,
      owner_id: u3,
      status: 'return_submitted',
      start_date: pastDate,
      due_date: today,
      picked_up_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      return_submitted_at: now.toISOString(),
      return_condition: 'Good',
      message: 'Used for breadboard testing. Returning today.'
    });
    await supabaseAdmin.from('items').update({ status: 'borrowed' }).eq('id', createdItems[4].id);
  }

  console.log('\n✅ Database seeding complete!');
  console.log('\nDemo accounts ready:');
  console.log('--------------------------------------------------');
  DEMO_USERS.forEach(u => {
    console.log(`Email:    ${u.email}`);
    console.log(`Password: ${u.password}`);
    console.log(`Profile:  ${u.full_name} (${u.college})\n`);
  });
}

seed().catch(err => {
  console.error('Seed script error:', err);
  process.exit(1);
});

