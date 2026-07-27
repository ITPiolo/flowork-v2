// Client-only: resizes an image down to a max dimension and re-encodes
// it as JPEG to shrink file size before upload. Skips SVGs and GIFs
// (would break vector scaling / animation) and anything already small
// enough that compressing wouldn't help.
export async function compressImage(file: File, maxDimension = 1920, quality = 0.8): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;
  if (file.size < 300 * 1024) return file; // already small, skip

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) return file;

  // Don't "compress" into something bigger than the original.
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
