const meta = {
  applicationId: 'com.jamienudge.statstrike',
  playStoreJoinUrl: 'https://play.google.com/apps/testing/com.jamienudge.statstrike',
  googleGroupUrl: 'https://groups.google.com/g/statstriketestgroup',
  playStoreInstallUrl:
    'https://play.google.com/store/apps/details?id=com.jamienudge.statstrike',
  googleGroupEmail: 'statstriketestgroup@googlegroups.com',
};

/** @typedef {{ id: string; label: string; status: 'pass' | 'fail' | 'manual'; detail: string }} Check */

/** @returns {Promise<{ checks: Check[]; manualPlayConsoleSteps: string[]; manualDeviceTestSteps: string[] }>} */
async function verifyStatStrikeClosedTestLinks() {
  /** @type {Check[]} */
  const checks = [];

  const optInResponse = await fetch(meta.playStoreJoinUrl, { method: 'HEAD', redirect: 'manual' });
  checks.push({
    id: 'opt-in-url',
    label: 'Play opt-in URL responds',
    status: optInResponse.status === 302 || optInResponse.status === 200 ? 'pass' : 'fail',
    detail: `GET ${meta.playStoreJoinUrl} → HTTP ${optInResponse.status}`,
  });

  const groupResponse = await fetch(meta.googleGroupUrl, { method: 'HEAD' });
  checks.push({
    id: 'google-group-url',
    label: 'Google Group URL responds',
    status: groupResponse.ok ? 'pass' : 'fail',
    detail: `GET ${meta.googleGroupUrl} → HTTP ${groupResponse.status}`,
  });

  const installUrl = new URL(meta.playStoreInstallUrl);
  checks.push({
    id: 'application-id',
    label: 'Install URL matches applicationId',
    status: installUrl.searchParams.get('id') === meta.applicationId ? 'pass' : 'fail',
    detail: `Expected id=${meta.applicationId}`,
  });

  checks.push({
    id: 'play-console-group-link',
    label: 'Google Group linked in Play Console',
    status: 'manual',
    detail: `In Play Console → Testing → Closed testing → Testers, confirm ${meta.googleGroupEmail} is listed under Google Groups.`,
  });

  checks.push({
    id: 'play-console-release',
    label: 'Closed test release available to testers',
    status: 'manual',
    detail:
      'In Play Console → Testing → Closed testing → Releases, confirm the latest release status is “Available to testers” and countries/regions include your testers.',
  });

  return {
    checks,
    manualPlayConsoleSteps: [
      'Open Google Play Console → StatStrike → Testing → Closed testing → Testers.',
      `Under Google Groups, confirm ${meta.googleGroupEmail} is listed and saved.`,
      'Open Closed testing → Releases and confirm status is “Available to testers”.',
      'Review country/region availability matches where your testers are located.',
    ],
    manualDeviceTestSteps: [
      'On an Android phone, sign in with a Google account that is not your developer account.',
      `Join ${meta.googleGroupUrl} with that account.`,
      'Wait at least 15 minutes for membership to sync.',
      `Open ${meta.playStoreJoinUrl} on the phone (same account).`,
      'Tap Become a tester, then install from Google Play.',
    ],
  };
}

function formatReport(report) {
  const lines = report.checks.map((check) => `[${check.status.toUpperCase()}] ${check.label}\n  ${check.detail}`);
  lines.push('', 'Manual Play Console checks:');
  for (const step of report.manualPlayConsoleSteps) lines.push(`  - ${step}`);
  lines.push('', 'Manual device test (non-developer account):');
  for (const step of report.manualDeviceTestSteps) lines.push(`  - ${step}`);
  return lines.join('\n');
}

const report = await verifyStatStrikeClosedTestLinks();
console.log(formatReport(report));

const failed = report.checks.filter((check) => check.status === 'fail');
if (failed.length > 0) process.exit(1);
