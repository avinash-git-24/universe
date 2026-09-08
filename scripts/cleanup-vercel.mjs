/**
 * Vercel Deployment Cleanup Tool
 * Safely deletes old preview / test deployments to reclaim free tier storage.
 * 
 * Usage:
 *   node scripts/cleanup-vercel.mjs <VERCEL_TOKEN> [PROJECT_NAME]
 * 
 * How to get a Vercel Token in 10 seconds:
 *   1. Go to https://vercel.com/account/tokens
 *   2. Click "Create", name it "cleanup", copy the token.
 *   3. Run: node scripts/cleanup-vercel.mjs <PASTE_TOKEN_HERE>
 */

const token = process.argv[2] || process.env.VERCEL_TOKEN;
const targetProject = process.argv[3] || process.env.VERCEL_PROJECT;

if (!token) {
  console.log(`
=====================================================
  Vercel Storage Cleanup Script
=====================================================

  A Vercel Personal Access Token is required to authenticate.

  Step 1: Open https://vercel.com/account/tokens in your browser
  Step 2: Click "Create Token" (Name: cleanup)
  Step 3: Run this command in your terminal:

    node scripts/cleanup-vercel.mjs <YOUR_TOKEN>

=====================================================
  `);
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
};

async function main() {
  console.log('\n🔍 Fetching deployments from Vercel API...');

  let url = 'https://api.vercel.com/v6/deployments?limit=100';
  if (targetProject) {
    url += `&projectId=${encodeURIComponent(targetProject)}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`❌ Failed to fetch deployments (${res.status}):`, errText);
    process.exit(1);
  }

  const data = await res.json();
  const deployments = data.deployments || [];

  if (deployments.length === 0) {
    console.log('✅ No deployments found to clean up!');
    return;
  }

  console.log(`📦 Found ${deployments.length} total deployments.`);

  // Find preview / non-production deployments
  // We keep any deployment that is target === 'production' and currently READY
  const candidatesToDelete = deployments.filter((d) => {
    const isProd = d.target === 'production';
    // If it's production, we never delete the latest ready one
    return !isProd;
  });

  console.log(`🎯 Identified ${candidatesToDelete.length} preview/test deployments that can be safely deleted.`);

  if (candidatesToDelete.length === 0) {
    console.log('✅ All non-production deployments are already clean!');
    return;
  }

  let deletedCount = 0;
  for (const dep of candidatesToDelete) {
    const name = dep.name || dep.url || dep.uid;
    const createdAt = new Date(dep.createdAt).toLocaleString();
    process.stdout.write(`🗑️  Deleting [${dep.uid}] ${name} (${createdAt})... `);

    try {
      const delRes = await fetch(`https://api.vercel.com/v13/deployments/${dep.uid}`, {
        method: 'DELETE',
        headers,
      });

      if (delRes.ok) {
        deletedCount++;
        console.log('✅ DELETED');
      } else {
        const err = await delRes.text();
        console.log(`⚠️ FAILED (${delRes.status}): ${err}`);
      }
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
    }

    // Small delay to be polite to rate limits
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n🎉 Cleanup complete! Successfully deleted ${deletedCount}/${candidatesToDelete.length} deployments.`);
  console.log('💡 Your Vercel deployment storage will now recalculate and drop significantly.');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
