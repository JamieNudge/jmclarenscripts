export function parseDgcHostList(raw?: string): Set<string> {
  const value = raw ?? process.env.DGC_HUB_HOSTS ?? 'dgc.jmclarenscripts.vercel.app';
  return new Set(
    value
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isDgcHostname(host: string): boolean {
  const normalized = host.split(':')[0]?.toLowerCase() ?? '';
  return normalized.length > 0 && parseDgcHostList().has(normalized);
}
