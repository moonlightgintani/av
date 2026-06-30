import type { DriveFile } from "./drive";

// Eagerly glob scan all files under /public/images/
const imageFiles = import.meta.glob("/public/images/**/*.{jpg,jpeg,png,webp,gif,svg}", {
  eager: true,
});

const videoFiles = import.meta.glob("/public/images/**/*.{mp4,webm,mov,MOV}", { eager: true });

function getMimeType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase();
  if (ext === "mp4") return "video/mp4";
  if (ext === "webm") return "video/webm";
  if (ext === "mov") return "video/quicktime";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "webp") return "image/webp";
  if (ext === "svg") return "image/svg+xml";
  return "image/jpeg";
}

export function getLocalMedia(): (DriveFile & { folder: string })[] {
  const list: (DriveFile & { folder: string })[] = [];

  const processFile = (key: string, val: unknown, isVideo: boolean) => {
    // E.g. key = "/public/images/engagement/photo1.jpg"
    // val.default is the served asset URL (e.g. "/images/engagement/photo1.jpg")
    const src = (val as { default?: string })?.default ?? key;

    // Normalize path to extract subfolder
    const normalizedKey = key.startsWith("/public") ? key.substring(7) : key;
    const parts = normalizedKey.split("/");
    const folder = parts[2] || "gallery";

    const fileNameWithExt = parts[parts.length - 1];
    const fileName = fileNameWithExt.split(".")[0];
    const name = fileName.replace(/[-_]/g, " ");
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    list.push({
      id: key,
      name: formattedName,
      mimeType: getMimeType(key),
      width: isVideo ? 1920 : 1600,
      height: isVideo ? 1080 : 1067,
      thumbnail: src,
      src: src,
      preview: src,
      isVideo: isVideo,
      folder: folder,
    });
  };

  for (const [key, val] of Object.entries(imageFiles)) {
    processFile(key, val, false);
  }

  for (const [key, val] of Object.entries(videoFiles)) {
    processFile(key, val, true);
  }

  return list;
}
