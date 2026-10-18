import { defaultsFor, getResource } from "@svateh/core";
import { connectDB } from "../connect";
import { resourceModels } from "../models";
import { plain } from "./util";

/** Loads a singleton resource (settings, shipping…) merged over its defaults. */
export async function getSingleton<T = Record<string, any>>(key: string): Promise<T> {
  const r = getResource(key);
  if (!r?.singleton) throw new Error(`Unknown singleton ${key}`);
  await connectDB();
  const doc = await resourceModels[key]!.findOne().lean();
  return plain({ ...defaultsFor(r.fields), ...(doc ?? {}) }) as T;
}

export type SiteSettingsData = {
  brandName: string;
  tagline: string;
  logo: string;
  favicon: string;
  colorViolet: string;
  colorPlum: string;
  colorBlush: string;
  colorGold: string;
  colorCream: string;
  colorInk: string;
  announcementEnabled: boolean;
  announcementText: string;
  announcementLink: string;
  bestsellersLabel: string;
  showShadeFinder: boolean;
  showCommunity: boolean;
  showBundles: boolean;
  contactEmail: string;
  phone: string;
  whatsapp: string;
  supportHours: string;
  responseTime: string;
  address: string;
  businessDisclosure: string;
  socials: { platform: string; url: string }[];
  newsletterTitle: string;
  newsletterText: string;
  footerNote: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  ga4Id: string;
  metaPixelId: string;
  cookieNotice: string;
};

export type ShippingData = {
  freeShippingThreshold: number | null;
  standardFee: number | null;
  standardEta: string;
  expressEnabled: boolean;
  expressFee: number | null;
  expressEta: string;
  serviceability: string;
  pincodes: string;
  blockedPincodes: string;
  razorpayEnabled: boolean;
  codEnabled: boolean;
  codFee: number | null;
  codMinOrder: number | null;
  codMaxOrder: number | null;
  codBlockedPincodes: string;
  dispatchNote: string;
  returnsNote: string;
  lowStockThreshold: number | null;
};

export const getSettings = () => getSingleton<SiteSettingsData>("settings");
export const getShipping = () => getSingleton<ShippingData>("shipping");
