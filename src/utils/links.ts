export function normalizeLink(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (hasExplicitScheme(trimmed) || isNetworkPath(trimmed) || isIpv4Target(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function isValidQrTarget(value: string) {
  const trimmed = value.trim();

  if (!trimmed || /[\u0000-\u001F]/.test(trimmed)) {
    return false;
  }

  if (isNetworkPath(trimmed) || isIpv4Target(trimmed)) {
    return true;
  }

  if (!hasExplicitScheme(trimmed)) {
    return false;
  }

  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

function hasExplicitScheme(value: string) {
  return /^[a-z][a-z0-9+.-]*:/i.test(value);
}

function isNetworkPath(value: string) {
  return (
    /^(?:\\\\|\/\/)[^\\/]+[\\/][^\\/]+/.test(value) ||
    /^[a-z]:[\\/].+/i.test(value) ||
    /^[^\\/:\s]+\\.+/.test(value)
  );
}

function isIpv4Target(value: string) {
  const normalized = value.replace(/\\/g, "/");
  const hostWithPort = normalized.split("/")[0] ?? "";
  const host = hostWithPort.split(":")[0] ?? "";

  return isIpv4Address(host);
}

function isIpv4Address(value: string) {
  const parts = value.split(".");

  return (
    parts.length === 4 &&
    parts.every((part) => {
      if (!/^\d{1,3}$/.test(part)) {
        return false;
      }

      const number = Number(part);
      return number >= 0 && number <= 255;
    })
  );
}
