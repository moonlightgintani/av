import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSettings } from "@/lib/store";
import { PageHeader } from "@/components/PageHeader";
import { Lock, RefreshCw, Save } from "lucide-react";
import { extractDriveFolderId } from "@/lib/driveUtils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

function Page() {
  const s = useSettings();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!authed) {
    return (
      <div className="grid min-h-screen place-items-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw === s.adminPassword) setAuthed(true);
            else setErr(true);
          }}
          className="glass shadow-elegant w-full max-w-md rounded-3xl border border-primary/20 p-10 text-center"
        >
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-primary/30 text-primary">
            <Lock size={16} />
          </div>
          <h1 className="font-display mt-4 text-3xl">Admin</h1>
          <p className="text-muted-foreground mt-1 text-xs tracking-[0.3em] uppercase">
            Private area
          </p>
          <input
            autoFocus
            type="password"
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setErr(false);
            }}
            placeholder="Password"
            className="bg-background/70 border-border focus:border-primary mt-6 w-full rounded-full border px-5 py-3 text-center outline-none"
          />
          {err && <p className="text-destructive mt-2 text-xs">Wrong password</p>}
          <button className="gradient-luxe mt-4 w-full rounded-full px-6 py-3 text-sm tracking-[0.3em] text-white uppercase">
            Enter
          </button>
          <p className="text-muted-foreground mt-4 text-[10px]">
            Default: <code>admin</code> — change it below after login.
          </p>
        </form>
      </div>
    );
  }

  const handleSaveTheDateChange = (key: string, val: string | boolean) => {
    s.set({
      saveTheDate: {
        ...s.saveTheDate,
        [key]: val,
      },
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Admin Panel"
        subtitle="Configure your album. Changes save automatically to this browser."
      />
      <section className="mx-auto max-w-3xl space-y-10 px-6 pb-24">
        <Block title="Media Synchronization Source">
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Select where the website loads your photos and videos from.
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider cursor-pointer">
                <input
                  type="radio"
                  name="mediaSource"
                  checked={s.mediaSource === "drive"}
                  onChange={() => s.set({ mediaSource: "drive" })}
                />
                Google Drive
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider cursor-pointer">
                <input
                  type="radio"
                  name="mediaSource"
                  checked={s.mediaSource === "local"}
                  onChange={() => s.set({ mediaSource: "local" })}
                />
                Local Project Folders
              </label>
            </div>

            {s.mediaSource === "local" ? (
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 text-xs space-y-2">
                <p className="font-semibold text-primary">Local Folder Guide:</p>
                <p className="text-muted-foreground">
                  The application is scanning files in your project directory at{" "}
                  <code>public/images/</code>.
                </p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                  <li>
                    Drop your photos under <code>public/images/engagement/</code> or{" "}
                    <code>public/images/wedding/</code>.
                  </li>
                  <li>
                    You can create custom folders (e.g. <code>public/images/reception/</code>) and
                    they will automatically show up as new category tabs on the Gallery page!
                  </li>
                  <li>
                    Support file extensions: <code>.jpg</code>, <code>.jpeg</code>,{" "}
                    <code>.png</code>, <code>.webp</code>, <code>.gif</code>, <code>.mp4</code>.
                  </li>
                </ul>
              </div>
            ) : (
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 text-xs">
                <p className="font-semibold text-primary">Google Drive Guide:</p>
                <p className="text-muted-foreground mt-1">
                  Paste the folder link or folder ID. The app automatically cleans full links into
                  IDs on paste!
                </p>
              </div>
            )}
          </div>
        </Block>

        <Block title="Website Identity">
          <Input label="Bride name" value={s.brideName} onChange={(v) => s.set({ brideName: v })} />
          <Input label="Groom name" value={s.groomName} onChange={(v) => s.set({ groomName: v })} />
          <Input
            label="Family name"
            value={s.familyName}
            onChange={(v) => s.set({ familyName: v })}
          />
          <Input
            label="Wedding date"
            type="date"
            value={s.weddingDate}
            onChange={(v) => s.set({ weddingDate: v })}
          />
          <Input label="Subtitle" value={s.subtitle} onChange={(v) => s.set({ subtitle: v })} />
          <Input
            label="Hero image URL (optional)"
            value={s.heroImage}
            onChange={(v) => s.set({ heroImage: v })}
          />
          <Input
            label="Engagement card background image URL (optional)"
            value={s.engagementHeroImage}
            onChange={(v) => s.set({ engagementHeroImage: v })}
          />
          <Input
            label="Kalupidithal card background image URL (optional)"
            value={s.kalupidithalHeroImage}
            onChange={(v) => s.set({ kalupidithalHeroImage: v })}
          />
          <Input
            label="Wedding card background image URL (optional)"
            value={s.weddingHeroImage}
            onChange={(v) => s.set({ weddingHeroImage: v })}
          />
          <Input
            label="Reception card background image URL (optional)"
            value={s.receptionHeroImage}
            onChange={(v) => s.set({ receptionHeroImage: v })}
          />
          <Input
            label="Album PDF Link / Drive ID (optional)"
            value={s.albumPdfUrl}
            onChange={(v) => s.set({ albumPdfUrl: v })}
          />
          <Input
            label="Background music URL (mp3, optional)"
            value={s.musicUrl}
            onChange={(v) => s.set({ musicUrl: v })}
          />
          <Input
            label="Mobile APK Download Link (optional)"
            value={s.apkUrl}
            onChange={(v) => s.set({ apkUrl: v })}
          />
        </Block>

        {s.mediaSource === "drive" && (
          <Block title="Google Drive Configuration">
            <p className="text-muted-foreground text-sm">
              Get a Google Drive API key from{" "}
              <a
                className="text-primary underline"
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Cloud Console
              </a>
              . Share each folder as "Anyone with the link → Viewer". You can paste full links, and
              they will clean to IDs.
            </p>
            <Input
              label="Drive API Key"
              value={s.driveApiKey}
              onChange={(v) => s.set({ driveApiKey: v })}
            />
            <Input
              label="Engagement Photos folder ID / link"
              value={s.folders.engagementPhotos}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, engagementPhotos: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Engagement Videos folder ID / link"
              value={s.folders.engagementVideos}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, engagementVideos: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Bride's Album (Unified) folder ID / link"
              value={s.folders.brideAlbum}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, brideAlbum: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Groom's Album (Unified) folder ID / link"
              value={s.folders.groomAlbum}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, groomAlbum: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Wedding Photos (Main) folder ID / link"
              value={s.folders.weddingPhotos}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, weddingPhotos: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Wedding Photos (Bride's Side) folder ID / link"
              value={s.folders.weddingPhotosBride}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, weddingPhotosBride: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Wedding Photos (Groom's Side) folder ID / link"
              value={s.folders.weddingPhotosGroom}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, weddingPhotosGroom: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Reception Photos (Main) folder ID / link"
              value={s.folders.receptionPhotos}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, receptionPhotos: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Reception Photos (Bride's Side) folder ID / link"
              value={s.folders.receptionPhotosBride}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, receptionPhotosBride: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Reception Photos (Groom's Side) folder ID / link"
              value={s.folders.receptionPhotosGroom}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, receptionPhotosGroom: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Cinematic Memories Videos folder ID / link"
              value={s.folders.cinematicVideos}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, cinematicVideos: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Kalupidithal Photos (Main) folder ID / link"
              value={s.folders.kalupidithalPhotos}
              onChange={(v) =>
                s.set({ folders: { ...s.folders, kalupidithalPhotos: extractDriveFolderId(v) } })
              }
            />
            <Input
              label="Kalupidithal Photos (Bride's Side) folder ID / link"
              value={s.folders.kalupidithalPhotosBride}
              onChange={(v) =>
                s.set({
                  folders: { ...s.folders, kalupidithalPhotosBride: extractDriveFolderId(v) },
                })
              }
            />
            <Input
              label="Kalupidithal Photos (Groom's Side) folder ID / link"
              value={s.folders.kalupidithalPhotosGroom}
              onChange={(v) =>
                s.set({
                  folders: { ...s.folders, kalupidithalPhotosGroom: extractDriveFolderId(v) },
                })
              }
            />
            <button
              onClick={() => {
                s.refresh();
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
              }}
              className="border-primary/40 text-primary hover:bg-primary/10 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs tracking-[0.25em] uppercase"
            >
              <RefreshCw size={14} /> Refresh gallery cache
            </button>
          </Block>
        )}

        <Block title="Save The Date Customization">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={s.saveTheDate?.enabled ?? true}
              onChange={(e) => handleSaveTheDateChange("enabled", e.target.checked)}
            />
            Enable Save The Date countdown &amp; Invitation
          </label>

          <Input
            label="Invitation Title"
            value={s.saveTheDate?.title ?? "Save Our Date"}
            onChange={(v) => handleSaveTheDateChange("title", v)}
          />
          <Input
            label="Venue Name"
            value={s.saveTheDate?.venueName ?? "The Grand Palace"}
            onChange={(v) => handleSaveTheDateChange("venueName", v)}
          />
          <Input
            label="Venue Address"
            value={s.saveTheDate?.venueAddress ?? ""}
            onChange={(v) => handleSaveTheDateChange("venueAddress", v)}
          />
          <Input
            label="Time (e.g. 10:30 AM)"
            value={s.saveTheDate?.time ?? "10:30 AM"}
            onChange={(v) => handleSaveTheDateChange("time", v)}
          />
          <label className="block">
            <span className="text-foreground/80 text-xs tracking-[0.25em] uppercase">
              Invitation Message
            </span>
            <textarea
              id="invitation-message"
              rows={3}
              placeholder="E.g. We are getting married! Join us to celebrate our forever union."
              value={s.saveTheDate?.description ?? ""}
              onChange={(e) => handleSaveTheDateChange("description", e.target.value)}
              className="bg-background/70 border-border focus:border-primary mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            />
          </label>
          <Input
            label="Google Maps URL"
            value={s.saveTheDate?.mapsUrl ?? "https://maps.google.com"}
            onChange={(v) => handleSaveTheDateChange("mapsUrl", v)}
          />
          <label className="block">
            <span className="text-foreground/80 text-xs tracking-[0.25em] uppercase">
              Design Theme
            </span>
            <select
              id="design-theme"
              value={s.saveTheDate?.theme ?? "gold"}
              onChange={(e) => handleSaveTheDateChange("theme", e.target.value)}
              className="bg-background/70 border-border focus:border-primary mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            >
              <option value="gold">Gold Luxury (Cream &amp; Gold)</option>
              <option value="rose">Rose Romance (Blush Pink)</option>
              <option value="emerald">Emerald Luxe (Deep Emerald Green &amp; Gold)</option>
            </select>
          </label>
          <Input
            label="RSVP Link (e.g. /contact or external URL)"
            value={s.saveTheDate?.rsvpUrl ?? "/contact"}
            onChange={(v) => handleSaveTheDateChange("rsvpUrl", v)}
          />
          <Input
            label="Calendar Event Note"
            value={s.saveTheDate?.calendarNotes ?? ""}
            onChange={(v) => handleSaveTheDateChange("calendarNotes", v)}
          />
          <Input
            label="Save The Date Drive Folder ID / Link"
            value={s.saveTheDate?.folderId ?? "1U9O6ZE6TUGSUuJECJUMbcGgJvmEX1fiQ"}
            onChange={(v) => handleSaveTheDateChange("folderId", extractDriveFolderId(v))}
          />
          <Input
            label="Save The Date Drive Video Folder ID / Link"
            value={s.saveTheDate?.videoFolderId ?? "1p1IfCbIpYeHN9tIAjLl0KhV4Cm3Hu7-j"}
            onChange={(v) => handleSaveTheDateChange("videoFolderId", extractDriveFolderId(v))}
          />
        </Block>

        <Block title="Privacy">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={s.passwordEnabled}
              onChange={(e) => s.set({ passwordEnabled: e.target.checked })}
            />
            Require password to view the site
          </label>
          <Input
            label="Site password"
            value={s.sitePassword}
            onChange={(v) => s.set({ sitePassword: v })}
          />
          <Input
            label="Admin password"
            value={s.adminPassword}
            onChange={(v) => s.set({ adminPassword: v })}
          />
        </Block>

        <Block title="Curation">
          <p className="text-muted-foreground text-sm">
            Use the heart icon on any photo to favorite it. Featured ({s.featured.length}) and
            hidden ({s.hidden.length}) lists are managed there too. Clear lists below.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => s.set({ featured: [] })}
              className="border-border text-foreground/70 rounded-full border px-4 py-2 text-xs tracking-[0.25em] uppercase"
            >
              Clear featured
            </button>
            <button
              onClick={() => s.set({ hidden: [] })}
              className="border-border text-foreground/70 rounded-full border px-4 py-2 text-xs tracking-[0.25em] uppercase"
            >
              Clear hidden
            </button>
          </div>
        </Block>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <Save size={14} /> {saved ? "Saved" : "Changes save automatically"}
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card shadow-soft space-y-4 rounded-3xl border border-primary/15 p-7">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-foreground/80 text-xs tracking-[0.25em] uppercase">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-background/70 border-border focus:border-primary mt-2 w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
      />
    </label>
  );
}
