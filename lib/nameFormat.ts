export function formatNameWithWalletSuffix(name: string, address: string) {
  const n = name.trim();
  const a = address.trim();
  const suffix = a.length >= 6 ? a.slice(-6) : a;
  return `${n} • ${suffix}`;
}

