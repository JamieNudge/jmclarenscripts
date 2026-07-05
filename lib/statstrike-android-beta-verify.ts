import { statstrikeAndroidBetaMeta } from '@/lib/statstrike-android-beta-meta';

export type StatStrikeClosedTestCheck = {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'manual';
  detail: string;
};

export type StatStrikeClosedTestReport = {
  checks: StatStrikeClosedTestCheck[];
  manualPlayConsoleSteps: string[];
  manualDeviceTestSteps: string[];
};

/** External checks we can run without Play Console or a physical device. */
export async function verifyStatStrikeClosedTestLinks(): Promise<StatStrikeClosedTestReport> {
  const checks: StatStrikeClosedTestCheck[] = [];

  const optInResponse = await fetch(statstrikeAndroidBetaMeta.playStoreJoinUrl, {
    method: 'HEAD',
    redirect: 'manual',
  });
  checks.push({
    id: 'opt-in-url',
    label: 'Play opt-in URL responds',
    status: optInResponse.status === 302 || optInResponse.status === 200 ? 'pass' : 'fail',
    detail: `GET ${statstrikeAndroidBetaMeta.playStoreJoinUrl} → HTTP ${optInResponse.status}`,
  });

  const groupResponse = await fetch(statstrikeAndroidBetaMeta.googleGroupUrl, { method: 'HEAD' });
  checks.push({
    id: 'google-group-url',
    label: 'Google Group URL responds',
    status: groupResponse.ok ? 'pass' : 'fail',
    detail: `GET ${statstrikeAndroidBetaMeta.googleGroupUrl} → HTTP ${groupResponse.status}`,
  });

  const installUrl = new URL(statstrikeAndroidBetaMeta.playStoreInstallUrl);
  checks.push({
    id: 'application-id',
    label: 'Install URL matches applicationId',
    status:
      installUrl.searchParams.get('id') === statstrikeAndroidBetaMeta.applicationId ? 'pass' : 'fail',
    detail: `Expected id=${statstrikeAndroidBetaMeta.applicationId}`,
  });

  checks.push({
    id: 'play-console-group-link',
    label: 'Google Group linked in Play Console',
    status: 'manual',
    detail: `In Play Console → Testing → Closed testing → Testers, confirm ${statstrikeAndroidBetaMeta.googleGroupEmail} is listed under Google Groups.`,
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
      `Under Google Groups, confirm ${statstrikeAndroidBetaMeta.googleGroupEmail} is listed and saved.`,
      'Open Closed testing → Releases and confirm status is “Available to testers”.',
      'Review country/region availability matches where your testers are located.',
    ],
    manualDeviceTestSteps: [
      'On an Android phone, sign in with a Google account that is not your developer account.',
      `Join ${statstrikeAndroidBetaMeta.googleGroupUrl} with that account.`,
      'Wait at least 15 minutes for membership to sync.',
      `Open ${statstrikeAndroidBetaMeta.playStoreJoinUrl} on the phone (same account).`,
      'Tap Become a tester, then install from Google Play.',
    ],
  };
}

export function formatStatStrikeClosedTestReport(report: StatStrikeClosedTestReport): string {
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
