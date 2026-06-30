import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { MediaSection } from "@/components/MediaSection";
import { useSettings } from "@/lib/store";
import engagementImg from "@/assets/engagement.jpg";

export const Route = createFileRoute("/engagement")({
  head: () => ({
    meta: [
      { title: "Engagement — Our Wedding Story" },
      {
        name: "description",
        content: "The night we said yes — photographs and films from our engagement.",
      },
      { property: "og:title", content: "Engagement — Our Wedding Story" },
    ],
  }),
  component: Page,
});

function Page() {
  const { folders } = useSettings();
  return (
    <>
      <PageHeader
        eyebrow="Milestone One"
        title="Engagement"
        subtitle="The evening two families became one — soft laughter, golden light, and a promise we'll carry forever."
        image={engagementImg}
      />
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <MediaSection
          photoFolder={folders.engagementPhotos || "engagement"}
          videoFolder={folders.engagementVideos || "engagement"}
        />
      </section>
    </>
  );
}
