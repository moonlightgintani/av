import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SiteSettings = {
  coupleName: string;
  brideName: string;
  groomName: string;
  weddingDate: string; // ISO
  familyName: string;
  subtitle: string;
  heroImage: string; // url
  engagementHeroImage: string;
  kalupidithalHeroImage: string;
  weddingHeroImage: string;
  receptionHeroImage: string;
  albumPdfUrl: string;
  musicUrl: string;
  apkUrl: string;
  sitePassword: string; // shared password to unlock site
  adminPassword: string; // gate the admin page
  passwordEnabled: boolean;
  driveApiKey: string;
  folders: {
    engagementPhotos: string;
    engagementVideos: string;
    brideAlbum: string;
    groomAlbum: string;
    weddingPhotos: string;
    weddingPhotosBride: string;
    weddingPhotosGroom: string;
    receptionPhotos: string;
    receptionPhotosBride: string;
    receptionPhotosGroom: string;
    cinematicVideos: string;
    kalupidithalPhotos: string;
    kalupidithalPhotosBride: string;
    kalupidithalPhotosGroom: string;
  };
  featured: string[]; // file IDs featured
  hidden: string[]; // file IDs hidden
  favorites: string[]; // local favorites (file IDs)
  theme: "light" | "dark";
  bumpCacheKey: number;
  mediaSource: "local" | "drive";
  musicPlaying: boolean;
  saveTheDate: {
    enabled: boolean;
    title: string;
    coupleName?: string;
    weddingDate?: string;
    venueName: string;
    venueAddress: string;
    time: string;
    description: string;
    mapsUrl: string;
    theme: "gold" | "rose" | "emerald";
    rsvpUrl: string;
    calendarNotes: string;
    folderId: string;
    videoFolderId: string;
  };
};

type Actions = {
  set: (p: Partial<SiteSettings>) => void;
  toggleTheme: () => void;
  toggleFavorite: (id: string) => void;
  toggleFeatured: (id: string) => void;
  toggleHidden: (id: string) => void;
  refresh: () => void;
};

const initial: SiteSettings = {
  coupleName: import.meta.env.VITE_COUPLE_NAME || "Anupama & Vignesh",
  brideName: import.meta.env.VITE_BRIDE_NAME || "Anupama",
  groomName: import.meta.env.VITE_GROOM_NAME || "Vignesh",
  weddingDate: import.meta.env.VITE_WEDDING_DATE || "2026-01-24",
  familyName: import.meta.env.VITE_FAMILY_NAME || "The Family",
  subtitle: import.meta.env.VITE_SUBTITLE || "Two Hearts, One Journey, A Lifetime Together",
  heroImage: import.meta.env.VITE_HERO_IMAGE || "",
  engagementHeroImage: import.meta.env.VITE_ENGAGEMENT_HERO_IMAGE || "",
  kalupidithalHeroImage: import.meta.env.VITE_KALUPIDITHAL_HERO_IMAGE || "",
  weddingHeroImage: import.meta.env.VITE_WEDDING_HERO_IMAGE || "",
  receptionHeroImage: import.meta.env.VITE_RECEPTION_HERO_IMAGE || "",
  albumPdfUrl: import.meta.env.VITE_ALBUM_PDF_URL || "",
  musicUrl:
    import.meta.env.VITE_MUSIC_URL ||
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  apkUrl: import.meta.env.VITE_APK_URL || "/OurWeddingStory.apk",
  sitePassword: import.meta.env.VITE_SITE_PASSWORD || "love",
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || "admin",
  passwordEnabled: import.meta.env.VITE_PASSWORD_ENABLED === "true",
  driveApiKey: import.meta.env.VITE_DRIVE_API_KEY || "AIzaSyDPuSLh7jw0d7rnrvBohpTDZWfdUvupwUA",
  folders: {
    engagementPhotos:
      import.meta.env.VITE_ENGAGEMENT_PHOTOS_FOLDER || "1odPhSIR04Ueh7ZjhP6QhkrffOi_1o-YN",
    engagementVideos: import.meta.env.VITE_ENGAGEMENT_VIDEOS_FOLDER || "",
    brideAlbum: import.meta.env.VITE_BRIDE_ALBUM_FOLDER || "1bw_X8NT9gOMfFpVWn2cg9O8ml52TMQUN",
    groomAlbum: import.meta.env.VITE_GROOM_ALBUM_FOLDER || "1sTQ6J3DgN3z1x1NfuQZOp9GBx4NPx8L0",
    weddingPhotos: import.meta.env.VITE_WEDDING_PHOTOS_FOLDER || "",
    weddingPhotosBride: import.meta.env.VITE_WEDDING_PHOTOS_BRIDE_FOLDER || "",
    weddingPhotosGroom: import.meta.env.VITE_WEDDING_PHOTOS_GROOM_FOLDER || "",
    receptionPhotos: import.meta.env.VITE_RECEPTION_PHOTOS_FOLDER || "",
    receptionPhotosBride: import.meta.env.VITE_RECEPTION_PHOTOS_BRIDE_FOLDER || "",
    receptionPhotosGroom:
      import.meta.env.VITE_RECEPTION_PHOTOS_GROOM_FOLDER || "19c2o1hWjmstR7i7q_O4o66m84al6X4bs",
    cinematicVideos:
      import.meta.env.VITE_CINEMATIC_VIDEOS_FOLDER || "1LZFsxfOs7fdPwJg-OA7G8T3UL9bKZnxi",
    kalupidithalPhotos: import.meta.env.VITE_KALUPIDITHAL_PHOTOS_FOLDER || "",
    kalupidithalPhotosBride:
      import.meta.env.VITE_KALUPIDITHAL_PHOTOS_BRIDE_FOLDER || "1aSuSgG3zQJM9zj6OTl1GG7wVS4Q6ybqP",
    kalupidithalPhotosGroom:
      import.meta.env.VITE_KALUPIDITHAL_PHOTOS_GROOM_FOLDER || "1y7oP4BDhXIhQU8IlG1A3ekUxzZenWVpz",
  },
  featured: [],
  hidden: [],
  favorites: [],
  theme: "light",
  bumpCacheKey: 0,
  mediaSource: (import.meta.env.VITE_MEDIA_SOURCE as "local" | "drive") || "drive",
  musicPlaying: false,
  saveTheDate: {
    enabled: import.meta.env.VITE_SAVE_THE_DATE_ENABLED !== "false",
    title: import.meta.env.VITE_SAVE_THE_DATE_TITLE || "Save Our Date",
    venueName: import.meta.env.VITE_SAVE_THE_DATE_VENUE_NAME || "The Grand Palace",
    venueAddress:
      import.meta.env.VITE_SAVE_THE_DATE_VENUE_ADDRESS || "123 Elegance Boulevard, Royal Gardens",
    time: import.meta.env.VITE_SAVE_THE_DATE_TIME || "10:30 AM",
    description:
      import.meta.env.VITE_SAVE_THE_DATE_DESCRIPTION ||
      "We are getting married! Join us to celebrate our forever union.",
    mapsUrl: import.meta.env.VITE_SAVE_THE_DATE_MAPS_URL || "https://maps.google.com",
    theme: (import.meta.env.VITE_SAVE_THE_DATE_THEME as "gold" | "rose" | "emerald") || "gold",
    rsvpUrl: import.meta.env.VITE_SAVE_THE_DATE_RSVP_URL || "/contact",
    calendarNotes:
      import.meta.env.VITE_SAVE_THE_DATE_CALENDAR_NOTES ||
      "Save the Date! We'd be honored to have you with us.",
    folderId:
      import.meta.env.VITE_SAVE_THE_DATE_PHOTOS_FOLDER || "1U9O6ZE6TUGSUuJECJUMbcGgJvmEX1fiQ",
    videoFolderId:
      import.meta.env.VITE_SAVE_THE_DATE_VIDEOS_FOLDER || "1p1IfCbIpYeHN9tIAjLl0KhV4Cm3Hu7-j",
  },
};

export const useSettings = create<SiteSettings & Actions>()(
  persist(
    (set, get) => ({
      ...initial,
      set: (p: Partial<SiteSettings>) => set(p),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      toggleFavorite: (id: string) => {
        const f = new Set(get().favorites);
        if (f.has(id)) {
          f.delete(id);
        } else {
          f.add(id);
        }
        set({ favorites: [...f] });
      },
      toggleFeatured: (id: string) => {
        const f = new Set(get().featured);
        if (f.has(id)) {
          f.delete(id);
        } else {
          f.add(id);
        }
        set({ featured: [...f] });
      },
      toggleHidden: (id: string) => {
        const f = new Set(get().hidden);
        if (f.has(id)) {
          f.delete(id);
        } else {
          f.add(id);
        }
        set({ hidden: [...f] });
      },
      refresh: () => set({ bumpCacheKey: Date.now() }),
    }),
    {
      name: "wedding-site-settings",
      version: 19,
      merge: (persistedState: unknown, currentState: unknown) => {
        const merged = {
          ...(currentState as SiteSettings & Actions),
          ...(persistedState as Partial<SiteSettings & Actions>),
        };
        merged.musicPlaying = false; // Reset music playing state on refresh
        // Apply environment overrides so localstorage doesn't block .env changes
        if (import.meta.env.VITE_COUPLE_NAME) merged.coupleName = import.meta.env.VITE_COUPLE_NAME;
        if (import.meta.env.VITE_BRIDE_NAME) merged.brideName = import.meta.env.VITE_BRIDE_NAME;
        if (import.meta.env.VITE_GROOM_NAME) merged.groomName = import.meta.env.VITE_GROOM_NAME;
        if (import.meta.env.VITE_WEDDING_DATE)
          merged.weddingDate = import.meta.env.VITE_WEDDING_DATE;
        if (import.meta.env.VITE_FAMILY_NAME) merged.familyName = import.meta.env.VITE_FAMILY_NAME;
        if (import.meta.env.VITE_SUBTITLE) merged.subtitle = import.meta.env.VITE_SUBTITLE;
        merged.heroImage = import.meta.env.VITE_HERO_IMAGE || "";
        merged.engagementHeroImage = import.meta.env.VITE_ENGAGEMENT_HERO_IMAGE || "";
        merged.kalupidithalHeroImage = import.meta.env.VITE_KALUPIDITHAL_HERO_IMAGE || "";
        merged.weddingHeroImage = import.meta.env.VITE_WEDDING_HERO_IMAGE || "";
        merged.receptionHeroImage = import.meta.env.VITE_RECEPTION_HERO_IMAGE || "";
        if (import.meta.env.VITE_ALBUM_PDF_URL)
          merged.albumPdfUrl = import.meta.env.VITE_ALBUM_PDF_URL;
        if (import.meta.env.VITE_MUSIC_URL) merged.musicUrl = import.meta.env.VITE_MUSIC_URL;
        if (import.meta.env.VITE_APK_URL) merged.apkUrl = import.meta.env.VITE_APK_URL;
        if (import.meta.env.VITE_DRIVE_API_KEY)
          merged.driveApiKey = import.meta.env.VITE_DRIVE_API_KEY;

        if (!merged.folders) {
          merged.folders = { ...initial.folders };
        } else {
          merged.folders = { ...merged.folders };
        }
        if (import.meta.env.VITE_ENGAGEMENT_PHOTOS_FOLDER)
          merged.folders.engagementPhotos = import.meta.env.VITE_ENGAGEMENT_PHOTOS_FOLDER;
        if (import.meta.env.VITE_ENGAGEMENT_VIDEOS_FOLDER)
          merged.folders.engagementVideos = import.meta.env.VITE_ENGAGEMENT_VIDEOS_FOLDER;
        if (import.meta.env.VITE_BRIDE_ALBUM_FOLDER)
          merged.folders.brideAlbum = import.meta.env.VITE_BRIDE_ALBUM_FOLDER;
        if (import.meta.env.VITE_GROOM_ALBUM_FOLDER)
          merged.folders.groomAlbum = import.meta.env.VITE_GROOM_ALBUM_FOLDER;
        if (import.meta.env.VITE_WEDDING_PHOTOS_FOLDER)
          merged.folders.weddingPhotos = import.meta.env.VITE_WEDDING_PHOTOS_FOLDER;
        if (import.meta.env.VITE_WEDDING_PHOTOS_BRIDE_FOLDER)
          merged.folders.weddingPhotosBride = import.meta.env.VITE_WEDDING_PHOTOS_BRIDE_FOLDER;
        if (import.meta.env.VITE_WEDDING_PHOTOS_GROOM_FOLDER)
          merged.folders.weddingPhotosGroom = import.meta.env.VITE_WEDDING_PHOTOS_GROOM_FOLDER;
        if (import.meta.env.VITE_RECEPTION_PHOTOS_FOLDER)
          merged.folders.receptionPhotos = import.meta.env.VITE_RECEPTION_PHOTOS_FOLDER;
        if (import.meta.env.VITE_RECEPTION_PHOTOS_BRIDE_FOLDER)
          merged.folders.receptionPhotosBride = import.meta.env.VITE_RECEPTION_PHOTOS_BRIDE_FOLDER;
        if (import.meta.env.VITE_RECEPTION_PHOTOS_GROOM_FOLDER)
          merged.folders.receptionPhotosGroom = import.meta.env.VITE_RECEPTION_PHOTOS_GROOM_FOLDER;
        if (import.meta.env.VITE_CINEMATIC_VIDEOS_FOLDER)
          merged.folders.cinematicVideos = import.meta.env.VITE_CINEMATIC_VIDEOS_FOLDER;
        if (import.meta.env.VITE_KALUPIDITHAL_PHOTOS_FOLDER)
          merged.folders.kalupidithalPhotos = import.meta.env.VITE_KALUPIDITHAL_PHOTOS_FOLDER;
        if (import.meta.env.VITE_KALUPIDITHAL_PHOTOS_BRIDE_FOLDER)
          merged.folders.kalupidithalPhotosBride =
            import.meta.env.VITE_KALUPIDITHAL_PHOTOS_BRIDE_FOLDER;
        if (import.meta.env.VITE_KALUPIDITHAL_PHOTOS_GROOM_FOLDER)
          merged.folders.kalupidithalPhotosGroom =
            import.meta.env.VITE_KALUPIDITHAL_PHOTOS_GROOM_FOLDER;

        if (!merged.saveTheDate) {
          merged.saveTheDate = { ...initial.saveTheDate };
        } else {
          merged.saveTheDate = { ...merged.saveTheDate };
        }
        if (import.meta.env.VITE_SAVE_THE_DATE_PHOTOS_FOLDER)
          merged.saveTheDate.folderId = import.meta.env.VITE_SAVE_THE_DATE_PHOTOS_FOLDER;
        if (import.meta.env.VITE_SAVE_THE_DATE_VIDEOS_FOLDER)
          merged.saveTheDate.videoFolderId = import.meta.env.VITE_SAVE_THE_DATE_VIDEOS_FOLDER;

        return merged;
      },
    },
  ),
);

export function useUnlocked() {
  return useSettings((s) => !s.passwordEnabled);
}
