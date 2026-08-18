const meta = {
  applicationId: 'com.jamienudge.statstrike',
  playStoreInstallUrl:
    'https://play.google.com/store/apps/details?id=com.jamienudge.statstrike&pcampaignid=web_share',
};

/** @typedef {{ id: string; label: string; status: 'pass' | 'fail' | 'manual'; detail: string }} Check */

/** @returns {Promise<{ checks: Check[]; manualPlayConsoleSteps: string[]; manualDeviceTestSteps: string[] }>} */
async function verifyStatStrikeAndroidLinks() {
  /** @type {Check[]} */
  const checks = [];

  const playStoreResponse = await fetch(meta.playStoreInstallUrl, { method: 'HEAD', redirect: 'manual' });
  checks.push({
    id: 'play-store-url',
    label: 'Play Store listing URL responds',
    status: playStoreResponse.status === 302 || playStoreResponse.status === 200 ? 'pass' : 'fail',
    detail: `GET ${meta.playStoreInstallUrl} → HTTP ${playStoreResponse.status}`,
  });

  const installUrl = new URL(meta.playStoreInstallUrl);
  checks.push({
    id: 'application-id',
    label: 'Install URL matches applicationId',
    status: installUrl.searchParams.get('id') === meta.applicationId ? 'pass' : 'fail',
    detail: `Expected id=${meta.applicationId}`,
  });

  checks.push({
    id: 'play-console-production-availability',
    label: 'Google Play production listing is available',
    status: 'manual',
    detail:
      'In Play Console → StatStrike → Dashboard / Production, confirm the current release is active and the store listing changes are published.',
  });

  checks.push({
    id: 'play-console-country-availability',
    label: 'Google Play availability matches intended regions',
    status: 'manual',
    detail:
      'In Play Console → Reach and devices, confirm the production listing is available in the intended countries and on supported devices.',
  });

  return {
    checks,
    manualPlayConsoleSteps: [
      'Open Google Play Console → StatStrike.',
      'Confirm Production shows the latest approved release as active.',
      'Open Store listing and confirm the Android CTA changes are published.',
      'Review Reach and devices to confirm country/device availability matches your intended audience.',
    ],
    manualDeviceTestSteps: [
      'On an Android phone, open the public Google Play listing.',
      `Visit ${meta.playStoreInstallUrl}.`,
      'Confirm the listing loads, the app can be installed, and the Play badges/copy look correct.',
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

const report = await verifyStatStrikeAndroidLinks();
console.log(formatReport(report));

const failed = report.checks.filter((check) => check.status === 'fail');
if (failed.length > 0) process.exit(1);
