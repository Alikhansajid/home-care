import { db } from './db/index';
import { profiles, homes } from './db/schema';
import { eq } from 'drizzle-orm';

async function testInsert() {
  const userId = "test-user-" + Date.now();
  console.log('Testing insert for userId:', userId);

  try {
    // 1. Insert Profile
    await db.insert(profiles).values({
      id: userId,
      email: `${userId}@example.com`,
      full_name: "Test User",
    });
    console.log('Profile inserted.');

    // 2. Insert Home
    await db.insert(homes).values({
      user_id: userId,
      name: "Test Home",
    });
    console.log('Home inserted.');

    // 3. Verify
    const verifyProfiles = await db.select().from(profiles).where(eq(profiles.id, userId));
    const verifyHomes = await db.select().from(homes).where(eq(homes.user_id, userId));

    console.log('Verified Profiles:', verifyProfiles.length);
    console.log('Verified Homes:', verifyHomes.length);

    if (verifyProfiles.length > 0 && verifyHomes.length > 0) {
      console.log('DATA PERSISTENCE TEST PASSED');
    } else {
      console.log('DATA PERSISTENCE TEST FAILED');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Insert Error:', err);
    process.exit(1);
  }
}

testInsert();
