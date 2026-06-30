export function extractDriveFolderId(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();

  // Try matching /folders/ID
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{25,50})/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // Try matching ?id=ID or &id=ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,50})/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // If it's already a clean ID
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}
