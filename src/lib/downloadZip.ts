import JSZip from "jszip";
import type { DriveFile } from "./drive";

export type DownloadProgress = {
  current: number;
  total: number;
  percent: number;
  status: string;
};

/**
 * Downloads a list of DriveFiles as a single compressed ZIP file
 */
export async function downloadPhotosAsZip(
  items: DriveFile[],
  zipFilename: string = "wedding-photos.zip",
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  if (!items || items.length === 0) {
    throw new Error("No photos selected for download");
  }

  const zip = new JSZip();
  const total = items.length;

  onProgress?.({
    current: 0,
    total,
    percent: 0,
    status: `Preparing to download ${total} photos...`,
  });

  // Batch download in small chunks to avoid browser connection limits
  const BATCH_SIZE = 4;
  let completed = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);

    await Promise.all(
      chunk.map(async (item, idx) => {
        try {
          const res = await fetch(item.src);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();

          let ext = ".jpg";
          if (item.mimeType === "image/png" || item.src.endsWith(".png")) ext = ".png";
          if (item.mimeType === "image/webp" || item.src.endsWith(".webp")) ext = ".webp";
          if (item.mimeType === "image/gif" || item.src.endsWith(".gif")) ext = ".gif";

          const safeName = (item.name || `photo-${i + idx + 1}`)
            .replace(/[/\\?%*:|"<>]/g, "-")
            .replace(/\.[^/.]+$/, "");

          zip.file(`${safeName}-${item.id.slice(0, 6)}${ext}`, blob);
        } catch (err) {
          console.warn("Could not download item", item.src, err);
        } finally {
          completed++;
          onProgress?.({
            current: completed,
            total,
            percent: Math.round((completed / total) * 85),
            status: `Fetched ${completed} of ${total} photos...`,
          });
        }
      })
    );
  }

  onProgress?.({
    current: total,
    total,
    percent: 90,
    status: "Compressing ZIP file...",
  });

  const content = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress?.({
        current: total,
        total,
        percent: 90 + Math.round(metadata.percent * 0.09),
        status: `Generating ZIP: ${Math.round(metadata.percent)}%`,
      });
    }
  );

  onProgress?.({
    current: total,
    total,
    percent: 100,
    status: "Saving ZIP to your device...",
  });

  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = zipFilename.endsWith(".zip") ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
