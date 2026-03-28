"use client";
import { useEffect, useRef } from "react";
import { App } from "@capacitor/app";
import { Toast } from "@capacitor/toast";
import { useRouter, usePathname } from "next/navigation";

export default function AppBackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const lastPressRef = useRef<number>(0);

  useEffect(() => {
    const backListener = App.addListener("backButton", async (data: any) => {
      const isRootPage =
        pathname === "/" || pathname === "/dashboard" || pathname === "/home";

      if (isRootPage) {
        const now = Date.now();

        // 2. Check if the gap between presses is less than 2 secondss
        if (now - lastPressRef.current < 2000) {
          App.exitApp();
        } else {
          // 3. First press: Show the toast and update the timestamp
          lastPressRef.current = now;
          await Toast.show({
            text: "Press back again to exit",
            duration: "short",
            position: "bottom",
          });
        }
      } else {
        // 4. On any other page (Electricity, Airtime, etc.), just go back
        router.back();
      }
    });

    return () => {
      backListener.then((l) => l.remove());
    };
  }, [pathname, router]);

  return null;
}
