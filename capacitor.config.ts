import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wedding.story",
  appName: "Our Wedding Story",
  webDir: ".output/public",
  server: {
    // TIP: To make this a live shell app (so any website changes instantly update the Android/iOS app
    // without rebuilding the APK/IPA), uncomment the line below and set it to your deployed website URL.
    // url: 'https://everlasting-moments-album.pages.dev',
    cleartext: true,
  },
};

export default config;
