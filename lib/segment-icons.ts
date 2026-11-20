const SEGMENT_ICON_MAP: Record<string, string> = {
  gamepad: "/catalog/segment-gamepad.svg",
  phone: "/catalog/segment-phone.svg",
  globe: "/catalog/segment-globe.svg",
};

export function segmentIconSrc(icon: string): string {
  if (icon.startsWith("/") || icon.startsWith("http")) {
    return icon;
  }

  return SEGMENT_ICON_MAP[icon] ?? "/catalog/segment-gamepad.svg";
}
