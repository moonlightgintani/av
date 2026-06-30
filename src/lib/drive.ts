// Lightweight Google Drive v3 client for PUBLIC folders.
// Folders must be shared "Anyone with the link" or this will return 403.

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  width?: number;
  height?: number;
  durationMs?: number;
  thumbnail: string;
  src: string; // full-size view URL
  preview: string; // iframe-embeddable URL (videos)
  isVideo: boolean;
};

const API = "https://www.googleapis.com/drive/v3/files";

function thumbUrl(id: string, w = 800) {
  return `https://lh3.googleusercontent.com/d/${id}=w${w}`;
}

function viewUrl(id: string, w = 1920) {
  return `https://lh3.googleusercontent.com/d/${id}=w${w}`;
}

export async function listFolder(folderId: string, apiKey: string): Promise<DriveFile[]> {
  if (!folderId || !apiKey) return [];
  const out: DriveFile[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      key: apiKey,
      fields:
        "nextPageToken,files(id,name,mimeType,thumbnailLink,imageMediaMetadata(width,height),videoMediaMetadata(width,height,durationMillis))",
      pageSize: "1000",
      orderBy: "name",
    });
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) throw new Error(`Drive ${res.status}`);
    const json = await res.json();
    for (const f of json.files ?? []) {
      const isVideo = String(f.mimeType ?? "").startsWith("video/");
      const isImage = String(f.mimeType ?? "").startsWith("image/");
      if (!isVideo && !isImage) continue;
      out.push({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        width: f.imageMediaMetadata?.width ?? f.videoMediaMetadata?.width ?? 1600,
        height: f.imageMediaMetadata?.height ?? f.videoMediaMetadata?.height ?? 1067,
        durationMs: f.videoMediaMetadata?.durationMillis
          ? Number(f.videoMediaMetadata.durationMillis)
          : undefined,
        thumbnail: isVideo ? (f.thumbnailLink ?? thumbUrl(f.id, 800)) : thumbUrl(f.id, 800),
        src: isVideo ? `https://drive.google.com/uc?id=${f.id}` : viewUrl(f.id, 1920),
        preview: `https://drive.google.com/file/d/${f.id}/preview`,
        isVideo,
      });
    }
    pageToken = json.nextPageToken;
  } while (pageToken);
  return out;
}

export function formatDuration(ms?: number) {
  if (!ms) return "";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
