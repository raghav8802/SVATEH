export type SkinTone = "light" | "medium" | "deep";
export type UndertoneKey = "cool" | "neutral" | "warm" | "olive";

export type ShadeMatch = {
  id: string;
  name: string;
  tone: SkinTone;
  undertone: Exclude<UndertoneKey, "olive"> | "olive";
  undertoneLabel: string;
  hex: string;
  productName: string;
  price: number;
  image: string;
};

export type FaceModel = {
  id: string;
  image: string;
  alt: string;
  undertoneHint: number;
};

const unsplash = (id: string, width = 800) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;

export const SKIN_TONES: {
  id: SkinTone;
  label: string;
  images: string[];
}[] = [
  {
    id: "light",
    label: "light",
    images: [
      unsplash("1438761681033-6461ffad8d80", 400),
      unsplash("1494790108377-be9c29b29330", 400),
      unsplash("1534528741775-53994a69daeb", 400),
      unsplash("1544005313-94ddf0286df2", 400),
    ],
  },
  {
    id: "medium",
    label: "medium",
    images: [
      unsplash("1524504388940-b1c1722653e1", 400),
      unsplash("1580489944761-15a19d654956", 400),
      unsplash("1487412947147-5cebf100ffc2", 400),
      unsplash("1531746020798-e6953c6e8e04", 400),
    ],
  },
  {
    id: "deep",
    label: "deep",
    images: [
      unsplash("1531123897727-8f129e1688ce", 400),
      unsplash("1607746882042-944635dfe10e", 400),
      unsplash("1573496359142-b8d87734a5a2", 400),
      unsplash("1508214751196-bcfd4ca60f91", 400),
    ],
  },
];

export const MODELS_BY_TONE: Record<SkinTone, FaceModel[]> = {
  light: [
    {
      id: "light-1",
      image: unsplash("1438761681033-6461ffad8d80"),
      alt: "Light skin, cool-leaning undertone",
      undertoneHint: 22,
    },
    {
      id: "light-2",
      image: unsplash("1494790108377-be9c29b29330"),
      alt: "Light skin, neutral undertone",
      undertoneHint: 48,
    },
    {
      id: "light-3",
      image: unsplash("1534528741775-53994a69daeb"),
      alt: "Light skin, warm undertone",
      undertoneHint: 74,
    },
    {
      id: "light-4",
      image: unsplash("1544005313-94ddf0286df2"),
      alt: "Light skin, soft neutral undertone",
      undertoneHint: 40,
    },
  ],
  medium: [
    {
      id: "medium-1",
      image: unsplash("1524504388940-b1c1722653e1"),
      alt: "Medium skin, warm golden undertone",
      undertoneHint: 78,
    },
    {
      id: "medium-2",
      image: unsplash("1580489944761-15a19d654956"),
      alt: "Medium skin, cool undertone",
      undertoneHint: 28,
    },
    {
      id: "medium-3",
      image: unsplash("1487412947147-5cebf100ffc2"),
      alt: "Medium skin, warm undertone",
      undertoneHint: 70,
    },
    {
      id: "medium-4",
      image: unsplash("1531746020798-e6953c6e8e04"),
      alt: "Medium skin, neutral undertone",
      undertoneHint: 50,
    },
  ],
  deep: [
    {
      id: "deep-1",
      image: unsplash("1531123897727-8f129e1688ce"),
      alt: "Deep skin, cool undertone",
      undertoneHint: 24,
    },
    {
      id: "deep-2",
      image: unsplash("1607746882042-944635dfe10e"),
      alt: "Deep skin, warm undertone",
      undertoneHint: 76,
    },
    {
      id: "deep-3",
      image: unsplash("1573496359142-b8d87734a5a2"),
      alt: "Deep skin, neutral undertone",
      undertoneHint: 52,
    },
    {
      id: "deep-4",
      image: unsplash("1508214751196-bcfd4ca60f91"),
      alt: "Deep skin, warm golden undertone",
      undertoneHint: 82,
    },
  ],
};

const PRODUCT_IMAGE = unsplash("1556228578-0d85b1a4d571", 800);
const PRODUCT_NAME = "Skin Tint";
const PRODUCT_PRICE = 1295;

const SHADE_MAP: Record<
  SkinTone,
  Record<UndertoneKey, Omit<ShadeMatch, "tone" | "undertone" | "undertoneLabel">>
> = {
  light: {
    cool: {
      id: "porcelain-glow",
      name: "Porcelain Glow",
      hex: "#F3DFD2",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    neutral: {
      id: "soft-ivory",
      name: "Soft Ivory",
      hex: "#E8D4C4",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    warm: {
      id: "warm-sand",
      name: "Warm Sand",
      hex: "#E4C4A4",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    olive: {
      id: "light-olive",
      name: "Light Olive",
      hex: "#D4C4A0",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
  },
  medium: {
    cool: {
      id: "cool-almond",
      name: "Cool Almond",
      hex: "#D4A88A",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    neutral: {
      id: "honey-nude",
      name: "Honey Nude",
      hex: "#C9A07A",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    warm: {
      id: "warm-honey",
      name: "Warm Honey",
      hex: "#C4A06A",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    olive: {
      id: "medium-olive",
      name: "Medium Olive",
      hex: "#B8A070",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
  },
  deep: {
    cool: {
      id: "cool-mocha",
      name: "Cool Mocha",
      hex: "#8A6B5C",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    neutral: {
      id: "rich-cocoa",
      name: "Rich Cocoa",
      hex: "#6B5344",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    warm: {
      id: "warm-espresso",
      name: "Warm Espresso",
      hex: "#5C4033",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
    olive: {
      id: "deep-olive",
      name: "Deep Olive",
      hex: "#5A5840",
      productName: PRODUCT_NAME,
      price: PRODUCT_PRICE,
      image: PRODUCT_IMAGE,
    },
  },
};

export function undertoneFromSlider(value: number): Exclude<UndertoneKey, "olive"> {
  if (value < 34) return "cool";
  if (value < 67) return "neutral";
  return "warm";
}

export function matchShade(
  tone: SkinTone,
  slider: number,
  olive: boolean
): ShadeMatch {
  const key: UndertoneKey = olive ? "olive" : undertoneFromSlider(slider);
  const shade = SHADE_MAP[tone][key];
  const undertoneLabel = olive
    ? `${tone} · olive`
    : `${tone} · ${undertoneFromSlider(slider)}`;

  return {
    ...shade,
    tone,
    undertone: key,
    undertoneLabel,
  };
}
