/**
 * Kompresi foto bukti di sisi peramban.
 *
 * Proyek ini berjalan pada paket Firebase tanpa billing, sehingga Cloud Storage
 * belum tersedia. Foto disimpan sebagai data URL di dokumen Firestore, yang
 * memiliki batas 1 MiB per dokumen. Karena itu foto diperkecil dan di-encode
 * ulang menjadi JPEG sebelum dikirim.
 *
 * Menggambar ulang foto ke canvas juga membuang seluruh metadata EXIF/GPS asli,
 * jadi klaim "metadata dibersihkan" pada formulir benar-benar terjadi — bukan
 * sekadar teks.
 */

/** Batas berkas sumber sebelum dikompres. */
export const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

/** Batas panjang data URL agar dokumen Firestore tetap di bawah 1 MiB. */
export const MAX_DATA_URL_LENGTH = 680_000;

/** Sisi terpanjang setelah kompresi. */
const MAX_EDGE = 1600;

const JPEG_PREFIX = "data:image/jpeg;base64,";

export interface CompressedPhoto {
  /** Data URL JPEG siap disimpan di Firestore. */
  dataUrl: string;
  width: number;
  height: number;
  /** Ukuran biner perkiraan setelah kompresi. */
  bytes: number;
  originalBytes: number;
  /** Kualitas JPEG terakhir yang dipakai. */
  quality: number;
}

export class ImageCompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageCompressionError";
  }
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function loadSource(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // Firefox lama / format tertentu bisa menolak opsi ini; pakai fallback.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new ImageCompressionError("Gambar tidak dapat dibaca. Coba berkas lain."));
      element.src = objectUrl;
    });
    return image;
  } finally {
    // Aman dipanggil setelah onload; data gambar sudah masuk memori.
    URL.revokeObjectURL(objectUrl);
  }
}

function sourceSize(source: ImageBitmap | HTMLImageElement) {
  const width = "naturalWidth" in source ? source.naturalWidth : source.width;
  const height = "naturalHeight" in source ? source.naturalHeight : source.height;
  return { width, height };
}

/**
 * Mengompres `file` sampai muat di dokumen Firestore.
 *
 * Melempar `ImageCompressionError` dengan pesan Bahasa Indonesia yang siap
 * ditampilkan ke pengguna.
 */
export async function compressPhoto(file: File): Promise<CompressedPhoto> {
  if (!file.type.startsWith("image/")) {
    throw new ImageCompressionError("Berkas harus berupa gambar (JPG, PNG, atau WebP).");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new ImageCompressionError(
      `Ukuran foto maksimal ${formatFileSize(MAX_SOURCE_BYTES)} sebelum dikompres.`,
    );
  }

  const source = await loadSource(file);
  const original = sourceSize(source);
  if (original.width === 0 || original.height === 0) {
    if ("close" in source) source.close();
    throw new ImageCompressionError("Gambar tidak memiliki ukuran yang valid.");
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    if ("close" in source) source.close();
    throw new ImageCompressionError("Peramban ini belum mendukung kompresi gambar.");
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  let scale = Math.min(1, MAX_EDGE / Math.max(original.width, original.height));

  try {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const width = Math.max(1, Math.round(original.width * scale));
      const height = Math.max(1, Math.round(original.height * scale));

      canvas.width = width;
      canvas.height = height;

      // Latar putih agar PNG transparan tidak menjadi hitam saat diubah ke JPEG.
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, width, height);
      context.drawImage(source, 0, 0, width, height);

      for (const quality of [0.82, 0.74, 0.66, 0.58, 0.5]) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (!dataUrl.startsWith(JPEG_PREFIX) || dataUrl.length <= JPEG_PREFIX.length) {
          continue;
        }
        if (dataUrl.length <= MAX_DATA_URL_LENGTH) {
          return {
            dataUrl,
            width,
            height,
            bytes: Math.floor(((dataUrl.length - JPEG_PREFIX.length) * 3) / 4),
            originalBytes: file.size,
            quality,
          };
        }
      }

      scale *= 0.8;
    }
  } finally {
    if ("close" in source) source.close();
  }

  throw new ImageCompressionError(
    "Foto masih terlalu besar setelah dikompres. Coba pilih foto lain atau kecilkan resolusinya.",
  );
}
