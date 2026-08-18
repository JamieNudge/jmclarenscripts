import { statstrikeAndroidMeta } from '@/lib/statstrike-android-beta-meta';

export type StatStrikeAndroidListingCheck = {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'manual';
  detail: string;
};

export type StatStrikeAndroidListingReport = {
  checks: StatStrikeAndroidListingCheck[];
  manualPlayConsoleSteps: string[];
  manualDeviceTestSteps: string[];
};

/** External checks we can run against the live Android listing. */
export async function verifyStatStrikeAndroidLinks(): Promise<StatStrikeAndroidListingReport> {
  const checks: StatStrikeAndroidListingCheck[] = [];

  const playStoreResponse = await fetch(statstrikeAndroidMeta.playStoreInstallUrl, {
    method: 'HEAD',
    redirect: 'manual',
  });
  checks.push({
    id: 'play-store-url',
    label: 'Play Store listing URL responds',
    status: playStoreResponse.status === 302 || playStoreResponse.status === 200 ? 'pass' : 'fail',
    detail: `GET ${statstrikeAndroidMeta.playStoreInstallUrl} → HTTP ${playStoreResponse.status}`,
  });

  const installUrl = new URL(statstrikeAndroidMeta.playStoreInstallUrl);
  checks.push({
    id: 'application-id',
    label: 'Install URL matches applicationId',
    status:
      installUrl.searchParams.get('id') === statstrikeAndroidMeta.applicationId ? 'pass' : 'fail',
    detail: `Expected id=${statstrikeAndroidMeta.applicationId}`,
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
      `Visit ${statstrikeAndroidMeta.playStoreInstallUrl}.`,
      'Confirm the listing loads, the app can be installed, and the Play badges/copy look correct.',
    ],
  };
}

export function formatStatStrikeAndroidReport(report: StatStrikeAndroidListingReport): string {
  const lines = report.checks.map((check) => {
    const tag = check.status.toUpperCase();
    return `[${tag}] ${check.label}\n  ${check.detail}`;
  });

  lines.push('', 'Manual Play Console checks:');
  for (const step of report.manualPlayConsoleSteps) {
    lines.push(`  - ${step}`);
  }

  lines.push('', 'Manual device test (non-developer account):');
  for (const step of report.manualDeviceTestSteps) {
    lines.push(`  - ${step}`);
  }

  return lines.join('\n');
}
