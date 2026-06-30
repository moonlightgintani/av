import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Phone, User, Smartphone, AlertCircle } from "lucide-react";
import { useSettings } from "@/lib/store";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Our Wedding Story" },
      {
        name: "description",
        content: "Get in touch with the developer Surya.",
      },
      { property: "og:title", content: "Contact — Our Wedding Story" },
    ],
  }),
  component: Page,
});

function Page() {
  const apkUrl = useSettings((s) => s.apkUrl);
  const [showConfigAlert, setShowConfigAlert] = useState(false);

  const handleApkClick = async (e: React.MouseEvent) => {
    if (!apkUrl) {
      e.preventDefault();
      setShowConfigAlert(true);
      return;
    }
    if (apkUrl.startsWith("/")) {
      try {
        const response = await fetch(apkUrl, { method: "HEAD" });
        if (!response.ok) {
          e.preventDefault();
          setShowConfigAlert(true);
        }
      } catch (err) {
        e.preventDefault();
        setShowConfigAlert(true);
      }
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Say Hello"
        title="Get in Touch"
        subtitle="Contact developer Surya for support or custom modifications."
      />
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7 }}
        className="mx-auto max-w-lg px-6 pb-24 flex justify-center"
      >
        <div className="bg-card shadow-soft rounded-3xl border border-primary/15 p-10 flex flex-col justify-center relative overflow-hidden w-full">
          {/* Decorative design accent */}
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <span className="text-[10px] tracking-[0.4em] uppercase text-primary font-semibold">
            Developer Profile
          </span>
          <h3 className="font-display mt-4 text-4xl text-foreground flex items-center gap-2.5">
            <User size={28} className="text-primary" /> Surya Narayanan K S
          </h3>

          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full text-primary">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-muted-foreground text-[10px] tracking-widest uppercase">
                  Phone Number
                </p>
                <a
                  href="tel:9080296675"
                  className="text-foreground hover:text-primary block text-lg font-medium tracking-wide transition-colors"
                >
                  +91 9080296675
                </a>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-primary/10" />
          <div>
            <p className="text-muted-foreground text-[10px] tracking-widest uppercase mb-3">
              Mobile App
            </p>
            <a
              href={apkUrl || "#"}
              onClick={handleApkClick}
              download="OurWeddingStory.apk"
              target={apkUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="gradient-luxe shadow-soft flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-center text-sm font-semibold tracking-wider text-white hover:opacity-95 transition-opacity cursor-pointer"
            >
              <Smartphone size={18} /> Download Android App (APK)
            </a>
          </div>
        </div>
      </motion.section>

      <Dialog open={showConfigAlert} onOpenChange={setShowConfigAlert}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 font-display text-2xl">
              <AlertCircle className="text-primary" size={24} /> Configure App Download
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-4 text-sm leading-relaxed">
              The Android APK file has not been configured yet.
              <br />
              <br />
              <strong>To configure the download link:</strong>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Build your APK wrapper using Capacitor / Cordova.</li>
                <li>
                  Upload the built <code>.apk</code> file to your Google Drive or hosting provider.
                </li>
                <li>
                  Add the link to your environment variable:{" "}
                  <code>VITE_APK_URL="your-download-link"</code> in your <code>.env</code> file.
                </li>
              </ol>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
