"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const KEY = "svateh_consent";

/** Cookie notice + analytics. GA4 / Meta Pixel load only after the visitor accepts. */
export function Consent({ text, ga4Id, pixelId }: { text: string; ga4Id?: string; pixelId?: string }) {
  const [choice, setChoice] = useState<"yes" | "no" | null | undefined>(undefined);

  useEffect(() => {
    try {
      setChoice((localStorage.getItem(KEY) as "yes" | "no" | null) ?? null);
    } catch {
      setChoice(null);
    }
  }, []);

  const decide = (v: "yes" | "no") => {
    setChoice(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
  };

  const tracking = choice === "yes";
  return (
    <>
      {tracking && ga4Id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config',${JSON.stringify(ga4Id)});`}</Script>
        </>
      ) : null}
      {tracking && pixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixelId)});fbq('track','PageView');`}</Script>
      ) : null}
      {choice === null && (ga4Id || pixelId) ? (
        <div className="fixed inset-x-3 bottom-3 z-[55] mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-5 text-sm shadow-2xl sm:flex-row sm:items-center" role="region" aria-label="Cookie notice">
          <p className="flex-1 text-ink/80">{text}</p>
          <div className="flex gap-2">
            <button onClick={() => decide("no")} className="btn-outline !border-ink/30 !px-4 !py-2.5">
              Essential only
            </button>
            <button onClick={() => decide("yes")} className="btn-plum !px-4 !py-2.5">
              Accept
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
