import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/great-vibes/400.css";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FloatingPetals } from "@/components/FloatingPetals";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PasswordGate } from "@/components/PasswordGate";
import { useSettings } from "@/lib/store";

function NotFoundComponent() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="font-script text-gradient-luxe text-7xl">404</p>
        <p className="text-muted-foreground mt-4 tracking-[0.3em] uppercase text-xs">
          This page wandered off
        </p>
        <Link to="/" className="text-primary mt-6 inline-block text-sm hover:underline">
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl">This page didn't load</h1>
        <p className="text-muted-foreground mt-2 text-sm">Something went wrong.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="gradient-luxe rounded-full px-5 py-2.5 text-sm text-white"
          >
            Try again
          </button>
          <a href="/" className="border-border rounded-full border px-5 py-2.5 text-sm">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
      },
      { title: "Our Wedding Story — A Cinematic Album" },
      {
        name: "description",
        content:
          "A premium digital album of engagement and wedding memories — photographs, films, and stories.",
      },
      { name: "theme-color", content: "#c79a73" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { property: "og:title", content: "Our Wedding Story" },
      { property: "og:description", content: "A cinematic digital wedding album." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/jpeg", href: "/logo.jpeg" },
      { rel: "shortcut icon", href: "/logo.jpeg" },
      { rel: "apple-touch-icon", href: "/logo.jpeg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemedShell({ children }: { children: ReactNode }) {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return <>{children}</>;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemedShell>
        <LoadingScreen />
        <PasswordGate>
          <Nav />
          <FloatingPetals />
          <main className="relative z-20">
            <Outlet />
          </main>
          <Footer />
        </PasswordGate>
      </ThemedShell>
    </QueryClientProvider>
  );
}
