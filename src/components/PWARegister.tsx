"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("CuanKu PWA Service Worker terdaftar:", reg.scope);
          })
          .catch((err) => {
            console.warn("CuanKu PWA Service Worker registrasi gagal:", err);
          });
      });
    }
  }, []);

  return null;
}
