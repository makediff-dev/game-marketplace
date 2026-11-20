const MAX_EDGE = 1600;
const TARGET_BYTES = 700 * 1024;
const MIN_QUALITY = 0.55;

/** Downscale/re-encode photos so each upload stays under typical 1MB proxy limits. */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  if (file.size <= TARGET_BYTES && file.type === "image/jpeg") {
    return file;
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.82;
  let blob: Blob | null = null;

  while (quality >= MIN_QUALITY) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob || blob.size <= TARGET_BYTES) {
      break;
    }

    quality -= 0.09;
  }

  if (!blob) {
    return file;
  }

  // Prefer compressed even if only slightly smaller — proxy limits are strict.
  if (blob.size >= file.size && file.size <= TARGET_BYTES) {
    return file;
  }

  const name = file.name.replace(/\.\w+$/, "") || "image";
  return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
}
