import { connectDB } from "./connect";
import {
  Bundle,
  ByobConfig,
  Category,
  Faq,
  HomeSection,
  Mood,
  Page,
  Product,
  Routine,
  ShadeFinderConfig,
  ShippingSettings,
  SiteSettings,
} from "./models";

/**
 * Starter content so the store is fully navigable on day one.
 * Everything marked [PLACEHOLDER] must be replaced with real, verified
 * information before launch. No reviews or ratings are seeded — those must be genuine.
 */

const P = "[PLACEHOLDER] ";
const INCI = `${P}Replace with the complete, accurate INCI ingredient list from the product label before launch.`;

const shade = (name: string, sku: string, hex: string, extra: Record<string, any> = {}) => ({ name, sku, hex, stock: 25, active: true, ...extra });

export async function seedDatabase({ force = false } = {}) {
  await connectDB();
  if (!force && (await Product.estimatedDocumentCount()) > 0) {
    return { skipped: true, message: "The store already has products. Seeding skipped." };
  }
  if (force) {
    await Promise.all([Product, Category, Mood, Routine, Bundle, HomeSection, Page, Faq, ShadeFinderConfig, ByobConfig].map((M) => M.deleteMany({})));
  }

  const [face, lips, cheeks, eyes] = await Category.create([
    { name: "Face", slug: "face", intro: "Skin tints and complexion essentials that let your skin show through.", sortOrder: 1, showInMenu: true },
    { name: "Lips", slug: "lips", intro: "Glazes, tints and soft-focus colour for every mood.", sortOrder: 2, showInMenu: true },
    { name: "Cheeks", slug: "cheeks", intro: "Blushes and multi-use colour for a lit-from-within flush.", sortOrder: 3, showInMenu: true },
    { name: "Eyes", slug: "eyes", intro: "Brow and eye essentials for effortless definition.", sortOrder: 4, showInMenu: true },
  ]);

  const base = (o: Record<string, any>) => ({
    status: "published",
    images: [],
    ingredients: INCI,
    launchDate: new Date(),
    seoTitle: "",
    seoDescription: "",
    ...o,
  });

  const [skinFilter, velvetKiss, glowEdit, multiStick, browDefiner, lipGlaze] = await Product.create([
    base({
      name: "The Skin Filter",
      slug: "the-skin-filter",
      productType: "Serum skin tint",
      tagline: "Second-skin finish",
      category: face!._id,
      price: 1299,
      size: "30 ml",
      featured: true,
      sortOrder: 1,
      badges: ["new"],
      finish: "natural",
      coverage: "buildable",
      texture: "Lightweight serum",
      description: `<p>${P}A lightweight serum skin tint that evens tone while letting real skin show through. Replace with final product copy.</p>`,
      benefits: [`${P}Buildable, natural coverage`, `${P}Weightless serum texture`, `${P}Shades developed for Indian skin tones`],
      howToUse: ["Shake well.", "Dot onto the centre of the face.", "Blend outwards with fingertips or a damp sponge.", "Build a second layer where you want more coverage."],
      shadeGuide: `<p>${P}Our shades are named by depth and undertone. Not sure? Try the <a href="/shade-finder">Shade Finder</a>.</p>`,
      variants: [
        shade("01 Light Warm", "SF-01", "#EBCDB0", { depth: "light", undertone: "warm" }),
        shade("02 Light-Medium Neutral", "SF-02", "#DDB896", { depth: "light-medium", undertone: "neutral" }),
        shade("03 Medium Warm", "SF-03", "#C99A72", { depth: "medium", undertone: "warm" }),
        shade("04 Medium Olive", "SF-04", "#BB9168", { depth: "medium", undertone: "olive" }),
        shade("05 Tan Neutral", "SF-05", "#A0704C", { depth: "tan", undertone: "neutral" }),
        shade("06 Deep Warm", "SF-06", "#7A4F33", { depth: "deep", undertone: "warm" }),
      ],
      faqs: [{ question: "Is it suitable for oily skin?", answer: `${P}Answer based on product testing.` }],
    }),
    base({
      name: "Velvet Kiss",
      slug: "velvet-kiss",
      productType: "Mousse lipstick",
      tagline: "Soft-focus colour",
      category: lips!._id,
      price: 899,
      size: "4.5 g",
      featured: true,
      sortOrder: 2,
      finish: "soft-matte",
      coverage: "medium",
      texture: "Whipped mousse",
      description: `<p>${P}An airy mousse lipstick that blurs onto lips with soft-focus colour.</p>`,
      benefits: [`${P}Blurred, soft-matte finish`, `${P}Comfortable, weightless wear`, `${P}Dab on for a stain, layer for full colour`],
      howToUse: ["Apply to the centre of the lips.", "Press lips together or blur outwards with a fingertip.", "Layer for more intensity."],
      variants: [
        shade("Rose Nude", "VK-01", "#C27C7E"),
        shade("Pink Mood", "VK-02", "#D9748F"),
        shade("Berry Night", "VK-03", "#7E2C4A"),
        shade("Terracotta Kiss", "VK-04", "#B65A45"),
      ],
    }),
    base({
      name: "Glow Edit",
      slug: "glow-edit",
      productType: "Liquid highlighter",
      tagline: "Golden luminosity",
      category: face!._id,
      price: 999,
      size: "15 ml",
      featured: true,
      sortOrder: 3,
      finish: "luminous",
      coverage: "sheer",
      texture: "Fluid",
      description: `<p>${P}A liquid highlighter that melts into skin for a golden, lit-from-within glow.</p>`,
      benefits: [`${P}Mix with skin tint for all-over glow`, `${P}Dab on high points for a focused highlight`, `${P}No chunky glitter`],
      howToUse: ["Dot onto cheekbones, brow bones and the bridge of the nose.", "Tap in with fingertips.", "Or mix a drop into The Skin Filter for an all-over glow."],
      variants: [shade("Champagne Gold", "GE-01", "#E8CFA0"), shade("Rose Gold", "GE-02", "#E2A992")],
    }),
    base({
      name: "Multi Stick",
      slug: "multi-stick",
      productType: "Cheek & lip stick",
      tagline: "One product, multiple ways to wear it",
      category: cheeks!._id,
      price: 849,
      size: "6 g",
      featured: false,
      sortOrder: 4,
      finish: "satin",
      coverage: "buildable",
      texture: "Creamy balm",
      description: `<p>${P}A creamy multi-use stick for cheeks and lips.</p>`,
      benefits: [`${P}Cheeks and lips in one`, `${P}Blends with fingertips`, `${P}Travel-friendly`],
      howToUse: ["Swipe two dots onto the apples of the cheeks.", "Tap and blend upwards.", "Dab onto lips for a matching flush."],
      variants: [shade("Petal", "MS-01", "#E7A8B9"), shade("Peach Pop", "MS-02", "#EE9C7E"), shade("Mauve Hour", "MS-03", "#A86A82"), shade("Brick Rose", "MS-04", "#A4544E")],
    }),
    base({
      name: "Brow Definer",
      slug: "brow-definer",
      productType: "Brow pencil",
      tagline: "Soft, natural definition",
      category: eyes!._id,
      price: 649,
      size: "0.1 g",
      sortOrder: 5,
      finish: "matte",
      texture: "Fine-tip pencil",
      description: `<p>${P}A fine-tip brow pencil with a spoolie for natural, hair-like strokes.</p>`,
      benefits: [`${P}Ultra-fine tip`, `${P}Built-in spoolie`, `${P}Shades for Indian hair colours`],
      howToUse: ["Brush brows upwards with the spoolie.", "Fill sparse areas with light, hair-like strokes.", "Blend with the spoolie."],
      variants: [shade("Soft Brown", "BD-01", "#6B4A35"), shade("Dark Brown", "BD-02", "#4A3226"), shade("Soft Black", "BD-03", "#2B2220")],
    }),
    base({
      name: "Lip Glaze",
      slug: "lip-glaze",
      productType: "Glossy lip oil",
      tagline: "Glassy shine, sheer colour",
      category: lips!._id,
      price: 749,
      size: "5 ml",
      featured: true,
      sortOrder: 6,
      badges: ["new"],
      finish: "glossy",
      coverage: "sheer",
      texture: "Non-sticky glaze",
      description: `<p>${P}A non-sticky lip glaze with glassy shine and a sheer wash of colour.</p>`,
      benefits: [`${P}Non-sticky shine`, `${P}Wear alone or over lipstick`, `${P}Sheer, buildable colour`],
      howToUse: ["Apply directly to lips.", "Wear alone or layer over Velvet Kiss."],
      variants: [shade("Clear Glass", "LG-01", "#F3E3E6"), shade("Pink Glaze", "LG-02", "#E59AB0"), shade("Honey Nude", "LG-03", "#C9906F"), shade("Plum Glaze", "LG-04", "#8A3D5E")],
    }),
  ]);

  await Product.updateOne({ _id: skinFilter!._id }, { $set: { related: [glowEdit!._id, multiStick!._id, browDefiner!._id] } });
  await Product.updateOne({ _id: velvetKiss!._id }, { $set: { related: [lipGlaze!._id, multiStick!._id] } });

  const [starter, everyday, softGlam, lipEdit] = await Bundle.create([
    { name: "SVATEH Starter Kit", slug: "starter-kit", tagline: "Everything you need to start", description: `<p>${P}Skin, cheeks and lips — the essentials.</p>`, items: [{ product: skinFilter!._id, quantity: 1 }, { product: multiStick!._id, quantity: 1 }, { product: lipGlaze!._id, quantity: 1 }], price: 2599, active: true, sortOrder: 1 },
    { name: "Everyday Face Set", slug: "everyday-face-set", tagline: "Your daily four", description: `<p>${P}The Everyday Face routine in one set.</p>`, items: [{ product: skinFilter!._id, quantity: 1 }, { product: multiStick!._id, quantity: 1 }, { product: browDefiner!._id, quantity: 1 }, { product: lipGlaze!._id, quantity: 1 }], price: 3199, active: true, sortOrder: 2 },
    { name: "Soft Glam Set", slug: "soft-glam-set", tagline: "Luminous, defined, elevated", description: `<p>${P}For evenings and occasions.</p>`, items: [{ product: skinFilter!._id, quantity: 1 }, { product: glowEdit!._id, quantity: 1 }, { product: velvetKiss!._id, quantity: 1 }], price: 2899, active: true, sortOrder: 3 },
    { name: "The Lip Edit", slug: "lip-edit", tagline: "Matte meets glaze", description: `<p>${P}Velvet Kiss and Lip Glaze — wear alone or layered.</p>`, items: [{ product: velvetKiss!._id, quantity: 1 }, { product: lipGlaze!._id, quantity: 1 }], price: 1499, active: true, sortOrder: 4 },
  ]);

  await Mood.create([
    { name: "Pink Mood", slug: "pink-mood", tagline: "fresh, flushed, playful", color: "#E7A8B9", description: `<p>${P}A fresh, flushed look built on pinks.</p>`, products: [skinFilter!._id, multiStick!._id, lipGlaze!._id], steps: [{ title: "Even the skin", product: skinFilter!._id, text: "A thin layer, blended out." }, { title: "Flush", product: multiStick!._id, text: "Petal on cheeks and lips." }, { title: "Shine", product: lipGlaze!._id, text: "Pink Glaze on top." }], bundle: starter!._id, active: true, sortOrder: 1 },
    { name: "Nude Mood", slug: "nude-mood", tagline: "soft, polished, everyday", color: "#C99A72", description: `<p>${P}Polished, everyday neutrals.</p>`, products: [skinFilter!._id, browDefiner!._id, velvetKiss!._id], steps: [{ title: "Skin", product: skinFilter!._id, text: "" }, { title: "Brows", product: browDefiner!._id, text: "" }, { title: "Lips", product: velvetKiss!._id, text: "Rose Nude, blurred." }], bundle: everyday!._id, active: true, sortOrder: 2 },
    { name: "Soft Glam", slug: "soft-glam", tagline: "luminous, defined, elevated", color: "#C8A45D", description: `<p>${P}An elevated, luminous look.</p>`, products: [skinFilter!._id, glowEdit!._id, velvetKiss!._id], steps: [{ title: "Complexion", product: skinFilter!._id, text: "" }, { title: "Glow", product: glowEdit!._id, text: "" }, { title: "Lips", product: velvetKiss!._id, text: "" }], bundle: softGlam!._id, active: true, sortOrder: 3 },
    { name: "Date Night", slug: "date-night", tagline: "bold, sultry, statement", color: "#7E2C4A", description: `<p>${P}A bold lip, everything else soft.</p>`, products: [skinFilter!._id, browDefiner!._id, velvetKiss!._id], steps: [{ title: "Skin", product: skinFilter!._id, text: "" }, { title: "Brows", product: browDefiner!._id, text: "" }, { title: "Statement lip", product: velvetKiss!._id, text: "Berry Night." }], active: true, sortOrder: 4 },
    { name: "Glow Mode", slug: "glow-mode", tagline: "dewy, luminous, radiant", color: "#E8CFA0", description: `<p>${P}All-over dewy radiance.</p>`, products: [skinFilter!._id, glowEdit!._id, lipGlaze!._id], steps: [{ title: "Glow base", product: skinFilter!._id, text: "Mixed with a drop of Glow Edit." }, { title: "Highlight", product: glowEdit!._id, text: "" }, { title: "Glaze", product: lipGlaze!._id, text: "" }], active: true, sortOrder: 5 },
  ]);

  await Routine.create([
    { name: "The Everyday Face", slug: "everyday-face", summary: "Everyday wear", description: `<p>${P}Four steps that work together for a natural, put-together look.</p>`, steps: [{ title: "Skin", product: skinFilter!._id, text: "Even tone with a sheer layer." }, { title: "Cheeks", product: multiStick!._id, text: "Add a natural flush." }, { title: "Brows", product: browDefiner!._id, text: "Frame the face." }, { title: "Lips", product: lipGlaze!._id, text: "Finish with shine." }], active: true, sortOrder: 1 },
    { name: "The Soft Glam", slug: "soft-glam-routine", summary: "A more polished look", description: `<p>${P}Complexion, cheeks, glow and lips for occasions.</p>`, steps: [{ title: "Complexion", product: skinFilter!._id, text: "" }, { title: "Cheeks", product: multiStick!._id, text: "" }, { title: "Glow", product: glowEdit!._id, text: "" }, { title: "Lips", product: velvetKiss!._id, text: "" }], active: true, sortOrder: 2 },
    { name: "The 5-Minute Face", slug: "five-minute-face", summary: "A minimal look", description: `<p>${P}Three essentials for a quick routine.</p>`, steps: [{ title: "Skin", product: skinFilter!._id, text: "" }, { title: "Cheeks & lips", product: multiStick!._id, text: "" }, { title: "Brows", product: browDefiner!._id, text: "" }], active: true, sortOrder: 3 },
  ]);

  await ByobConfig.create({
    enabled: true,
    title: "Build Your Own SVATEH Bag",
    intro: "Choose a face, cheek and lip favourite — we’ll bag them together.",
    steps: [
      { label: "Choose your face product", help: "Skin tint or glow", products: [skinFilter!._id, glowEdit!._id] },
      { label: "Choose your cheek product", help: "Blush or multi-stick", products: [multiStick!._id] },
      { label: "Choose your lip product", help: "Glaze or lipstick", products: [lipGlaze!._id, velvetKiss!._id] },
    ],
    discountType: "none",
    discountValue: 0,
  });

  const sfShade: Record<string, string> = { light: "01 Light Warm", "light-medium": "02 Light-Medium Neutral", medium: "03 Medium Warm", tan: "05 Tan Neutral", deep: "06 Deep Warm" };
  const matches: any[] = [];
  for (const depth of Object.keys(sfShade)) {
    for (const undertone of ["warm", "cool", "neutral", "olive", "not-sure"]) {
      const name = depth === "medium" && undertone === "olive" ? "04 Medium Olive" : sfShade[depth]!;
      matches.push({ depth, undertone, product: skinFilter!._id, shadeName: name, explanation: `${P}Explain why ${name} suits ${depth} skin with ${undertone} undertones — use validated matching logic.` });
    }
  }
  await ShadeFinderConfig.create({
    enabled: true,
    title: "Find your shade",
    intro: "Three quick questions and we’ll match you to your SVATEH shade. You can change your answers at any time.",
    matches,
    brandMatches: [],
  });

  await HomeSection.create([
    { type: "hero", sortOrder: 1, enabled: true, eyebrow: "Luxury beauty. Simplified.", title: "Pamper\nYourself.\nThe World\nCan Wait.", body: "Multifunctional makeup in rich colour, soft textures and a hint of gold — made for Indian skin.", ctaLabel: "Shop now", ctaHref: "/shop", cta2Label: "Discover SVATEH", cta2Href: "/about", products: [velvetKiss!._id] },
    { type: "marquee", sortOrder: 2, enabled: true, body: "SVATEH ✦ PAMPER YOURSELF ✦ SOFT GLAM. BOLD MOOD. ✦ BEAUTY THAT DOES MORE ✦ THE WORLD CAN WAIT" },
    { type: "productGrid", sortOrder: 3, enabled: true, theme: "white", eyebrow: "The SVATEH Edit", title: "The Edit", body: "Your everyday essentials, thoughtfully chosen.", ctaLabel: "Shop all", ctaHref: "/shop" },
    { type: "multiUse", sortOrder: 4, enabled: true, theme: "cream", eyebrow: "Beauty that does more", title: "One product.\nMultiple ways\nto wear it.", body: "Fewer products, more looks.", items: [{ title: "Multi Stick", text: "Cheeks, lips and a wash of colour on lids.", href: "/products/multi-stick" }, { title: "Glow Edit", text: "Highlight, or mix into skin tint for all-over glow.", href: "/products/glow-edit" }, { title: "Lip Glaze", text: "Wear alone, or layer over lipstick.", href: "/products/lip-glaze" }] },
    { type: "moods", sortOrder: 5, enabled: true, theme: "plum", eyebrow: "Shop your mood", title: "How do you\nfeel today?", ctaLabel: "All moods", ctaHref: "/moods" },
    { type: "routine", sortOrder: 6, enabled: true, theme: "white", eyebrow: "Your 5-minute face", title: "Skin → Cheeks →\nBrows → Lips", body: "A simple routine for every day.", items: [{ title: "Skin", text: "The Skin Filter" }, { title: "Cheeks", text: "Multi Stick" }, { title: "Brows", text: "Brow Definer" }, { title: "Lips", text: "Lip Glaze" }], ctaLabel: "Shop the routine", ctaHref: "/routines" },
    { type: "why", sortOrder: 7, enabled: true, theme: "violet", eyebrow: "Why SVATEH", title: "Made to make\nbeauty easier.", items: [{ title: "Multifunctional", text: "Products that work harder, so your routine doesn’t have to." }, { title: "Made for Indian skin", text: `${P}Shades and formulas developed with Indian skin tones in mind.` }, { title: "Luxury, simplified", text: "Premium textures at a considered price." }] },
    { type: "shadeFinder", sortOrder: 8, enabled: true, theme: "blush", eyebrow: "Shade Finder", title: "Not sure what’s\nyour shade?", body: "Answer three quick questions and we’ll recommend your SVATEH match.", ctaLabel: "Find my shade", ctaHref: "/shade-finder" },
    { type: "community", sortOrder: 9, enabled: true, theme: "cream", eyebrow: "SVATEH Girls", title: "Real Girls. Real Skin.\nReal SVATEH.", ctaLabel: "Shop the look", ctaHref: "/community" },
    { type: "reviews", sortOrder: 10, enabled: true, theme: "white", eyebrow: "Reviews", title: "In their words" },
    { type: "story", sortOrder: 11, enabled: true, eyebrow: "The SVATEH philosophy", title: "Makeup\nwith\nglow.", body: "SVATEH is beauty with a point of view. Rich colour, soft textures and a hint of gold — designed to feel feminine, elevated and instantly recognisable.", quote: "Pamper yourself. The world can wait.", ctaLabel: "Discover SVATEH", ctaHref: "/about" },
    { type: "newsletter", sortOrder: 12, enabled: true, theme: "gold", eyebrow: "Join the SVATEH Girls", title: "First access,\nnew looks.", body: "New launches, looks and first access — straight to your inbox." },
  ]);

  const policy = (title: string, slug: string, sections: { heading: string; body: string }[]) => ({
    title,
    slug,
    kind: "policy",
    eyebrow: "Help",
    intro: `${P}This page contains placeholder text. Replace it with your final, legally reviewed policy before launch.`,
    sections: sections.map((s) => ({ ...s, body: `<p>${P}${s.body}</p>` })),
    published: true,
  });

  await Page.create([
    {
      title: "About SVATEH",
      slug: "about",
      kind: "story",
      eyebrow: "Our story",
      intro: "Beauty that does more.",
      sections: [
        { heading: "The problem", body: `<p>${P}Why complicated beauty routines can feel overwhelming.</p>` },
        { heading: "The SVATEH philosophy", body: `<p>${P}Effortless beauty and multifunctional products.</p>` },
        { heading: "The difference", body: `<p>${P}What SVATEH genuinely does differently.</p>` },
        { heading: "The founder story", body: `<p>${P}Who created SVATEH and why.</p>` },
        { heading: "Our commitments", body: `<p>${P}Only substantiated product and business claims.</p>` },
      ],
      ctaLabel: "Discover the SVATEH Edit",
      ctaHref: "/shop",
      published: true,
    },
    policy("Shipping Policy", "shipping-policy", [
      { heading: "Where we deliver", body: "Serviceable locations." },
      { heading: "Delivery times", body: "Estimated delivery timelines and dispatch times." },
      { heading: "Charges", body: "Shipping charges and free-shipping threshold." },
      { heading: "Tracking", body: "How customers receive tracking details." },
    ]),
    policy("Returns & Refunds", "returns-policy", [
      { heading: "Eligibility", body: "Which products can be returned and in what condition." },
      { heading: "Time limits", body: "How many days customers have to request a return." },
      { heading: "Damaged or incorrect products", body: "What to do if an item arrives damaged." },
      { heading: "Refund timelines", body: "How and when refunds are processed." },
    ]),
    policy("Privacy Policy", "privacy-policy", [
      { heading: "Information we collect", body: "Personal information collected." },
      { heading: "How we use it", body: "How information is used and shared." },
      { heading: "Your rights", body: "How customers can access or delete their data." },
    ]),
    policy("Terms & Conditions", "terms", [
      { heading: "Using this website", body: "Website use terms." },
      { heading: "Orders and pricing", body: "Order acceptance, pricing and availability." },
      { heading: "Other terms", body: "Other applicable terms." },
    ]),
  ]);

  const faq = (category: string, question: string, answer: string, sortOrder = 0) => ({ category, question, answer: `<p>${P}${answer}</p>`, sortOrder, published: true });
  await Faq.create([
    faq("about", "What is SVATEH?", "Short description of the brand, philosophy and range."),
    faq("products", "How do I use multifunctional products?", "Explain cheek/lip/eye usage."),
    faq("products", "Are your products vegan or cruelty-free?", "Only answer yes if certified and substantiated.", 1),
    faq("shades", "How do I find my shade?", 'Use our <a href="/shade-finder">Shade Finder</a> or contact us for help.'),
    faq("orders", "Can I change or cancel my order?", "Explain your actual process and time window."),
    faq("shipping", "How long does delivery take?", "Delivery timelines by region."),
    faq("payments", "Which payment methods do you accept?", "UPI, cards, netbanking and Cash on Delivery (where available)."),
    faq("returns", "What is your return policy?", 'Summarise and link to the <a href="/returns-policy">Returns policy</a>.'),
    faq("contact", "How can I reach customer support?", 'Use the <a href="/contact">contact form</a> or email us.'),
  ]);

  await SiteSettings.updateOne(
    {},
    { $setOnInsert: { brandName: "SVATEH", announcementEnabled: true, announcementText: "Free shipping on orders above ₹999", announcementLink: "/shop" } },
    { upsert: true },
  );
  await ShippingSettings.updateOne({}, { $setOnInsert: { freeShippingThreshold: 999, standardFee: 79, codEnabled: true, razorpayEnabled: true } }, { upsert: true });

  return { skipped: false, message: "Starter content created: 4 categories, 6 products, 4 bundles, 5 moods, 3 routines, homepage, pages and FAQs." };
}
