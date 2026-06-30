import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { useSettings } from "@/lib/store";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Our Wedding Story" },
      {
        name: "description",
        content: "How they met, why they chose each other, and the journey that brought us here.",
      },
      { property: "og:title", content: "About — Our Wedding Story" },
    ],
  }),
  component: Page,
});

function Page() {
  const { brideName, groomName, familyName } = useSettings();
  return (
    <>
      <PageHeader
        eyebrow="The Couple"
        title={`About ${brideName} & ${groomName}`}
        subtitle="A story written slowly, then all at once."
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="mx-auto max-w-3xl px-6 pb-24"
      >
        <div className="prose prose-neutral dark:prose-invert mx-auto max-w-none space-y-6 text-center">
          <p className="text-foreground/85 text-lg leading-relaxed">
            They met the way the best stories begin — quietly, then unforgettably. Through long
            walks, longer talks, and the small kindnesses that made a friendship feel like forever,{" "}
            {brideName} and {groomName} built something rare.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            This little corner of the internet is for the people who love them — a place to relive
            the laughter, the dancing, the tears of joy, and the moments that made their day
            extraordinary.
          </p>
          <p className="font-script text-gradient-luxe pt-6 text-5xl">— {familyName}</p>
        </div>
      </motion.section>
    </>
  );
}
