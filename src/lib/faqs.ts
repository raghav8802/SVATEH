import { shippingReturnsItems } from "@/lib/shippingReturns";

export type FaqItem = {
  question: string;
  answer: string;
  bullets?: string[];
  email?: string;
};

export type FaqSection = {
  id: string;
  title: string;
  items: FaqItem[];
};

export const faqIntro = {
  headline: "Beauty, made personal.",
  paragraphs: [
    "SVATE is a beauty brand created to make makeup accessible and easy for Indian women. We believe flawless makeup should not require a complicated ten-step routine. Our approach is simple: understand your skin, understand your undertone, choose the right product, and make it yours.",
    "SVATE is vegan & cruelty-free. Our products are designed to make modern beauty feel effortless, inclusive and easy to access.",
  ],
};

export const faqSections: FaqSection[] = [
  {
    id: "about-svate",
    title: "1. SVATE — The Brand",
    items: [
      {
        question: "What is SVATE?",
        answer:
          "SVATE is a beauty brand made for Indian women, with a focus on accessible, easy-to-use makeup that fits into real life. We believe beauty should feel personal, uncomplicated and empowering.",
      },
      {
        question: "What makes SVATE different?",
        answer:
          "SVATE believes great makeup should not come with a complicated ten-step routine. Our products are designed to make achieving a beautiful, polished look simple, intuitive and accessible.",
      },
      {
        question: "Who is SVATE for?",
        answer:
          "SVATE is for every Indian woman who wants makeup that feels easy, personal and made with her in mind — whether she is a makeup beginner or already loves experimenting with beauty.",
      },
      {
        question: "Is SVATE vegan?",
        answer: "Yes. SVATE is a vegan beauty brand.",
      },
      {
        question: "Is SVATE cruelty-free?",
        answer: "Yes. SVATE is cruelty-free.",
      },
      {
        question: "Is SVATE made for Indian skin?",
        answer:
          "Yes. Indian skin is at the heart of SVATE's shade philosophy. Our complexion products are developed with the diversity of Indian skin tones and, especially, undertones in mind.",
      },
      {
        question: "Does SVATE believe makeup should be complicated?",
        answer:
          "No. We believe the opposite. You should not need several products or ten different steps to create a flawless base. SVATE is designed to simplify your routine without compromising the finish.",
      },
    ],
  },
  {
    id: "skin-tone-undertone",
    title: "2. Skin Tone & Undertone — The SVATE Way",
    items: [
      {
        question: "Why does SVATE focus so much on undertones?",
        answer:
          "Because two people with a similar skin depth can have completely different undertones. Undertone is one of the most important factors in finding a complexion shade that looks natural and seamless.",
      },
      {
        question: "What is skin tone?",
        answer:
          "Skin tone is the depth of your complexion — for example, fair, light, medium, tan, deep or rich.",
      },
      {
        question: "What is undertone?",
        answer:
          "Undertone is the subtle colour underneath your skin. It remains relatively consistent even when your surface skin becomes more tanned or lighter.",
      },
      {
        question: "How many undertones does SVATE use for Indian women?",
        answer:
          "SVATE works with four key undertone families for Indian skin: Warm, Cool, Neutral and Olive.",
      },
      {
        question: "What is a warm undertone?",
        answer:
          "Warm undertones generally have golden, yellow, peachy or warm-looking qualities.",
      },
      {
        question: "What is a cool undertone?",
        answer:
          "Cool undertones generally have pink, rosy, red or bluish qualities.",
      },
      {
        question: "What is a neutral undertone?",
        answer:
          "Neutral undertones sit between warm and cool. The skin may not strongly pull yellow/golden or pink/rosy.",
      },
      {
        question: "What is an olive undertone?",
        answer:
          "Olive undertones can have a muted green, golden or slightly grey quality. Olive skin may find very yellow or very pink foundations look noticeably off.",
      },
      {
        question: "Can Indian women have an olive undertone?",
        answer:
          "Absolutely. Olive is one of the four undertone families SVATE recognises for Indian women.",
      },
      {
        question: "Can I have a combination of undertones?",
        answer:
          "Yes. Real skin does not always fit perfectly into a single box. Undertone categories are a practical guide to help you find the closest, most natural match.",
      },
      {
        question: "How can I find my undertone?",
        answer:
          "Look at your skin in natural daylight without a strong filter. Consider your veins, jewellery and whether your skin reads more golden, pink/rosy, balanced or olive/muted. Use SVATE's undertone guide as the final reference.",
      },
      {
        question: "Why shouldn't I choose foundation only by how light or dark it looks?",
        answer:
          "Because depth alone does not tell you whether a shade will look natural. The undertone needs to work with your skin too. SVATE encourages you to choose skin tone + undertone, not skin tone alone.",
      },
      {
        question: "Are SVATE shades designed for different Indian undertones?",
        answer:
          "Yes. SVATE's complexion shade philosophy is built around the diversity of Indian skin, with specific attention to Warm, Cool, Neutral and Olive undertones.",
      },
      {
        question: "What if I am between two SVATE shades?",
        answer:
          "Compare both shades on the jawline in natural daylight and choose the one that blends most seamlessly into your face and neck. Use SVATE's online shade guide or contact customer support if available.",
      },
    ],
  },
  {
    id: "shade-finder",
    title: "3. Finding Your SVATE Complexion Shade",
    items: [
      {
        question: "How do I choose my SVATE foundation or skin tint?",
        answer:
          "First identify your skin depth, then identify your undertone — Warm, Cool, Neutral or Olive. Use both pieces together with the SVATE shade guide.",
      },
      {
        question: "Where should I test my complexion shade?",
        answer:
          "The jawline is usually the most useful place because it helps you see whether the face transitions naturally into the neck.",
      },
      {
        question: "Why does my complexion product look orange, pink, yellow or grey?",
        answer:
          "This usually indicates a shade or undertone mismatch, although lighting, skincare and oxidation can also affect appearance. Recheck both shade depth and undertone.",
      },
      {
        question: "Can online shade matching be 100% accurate?",
        answer:
          "No online match can guarantee a perfect result because screens, lighting, cameras and individual skin can change how colours appear. SVATE's undertone guide is designed to make the process easier and more informed.",
      },
    ],
  },
  {
    id: "easy-base",
    title: "4. Easy, Flawless Base",
    items: [
      {
        question: "Do I need ten steps to get a flawless SVATE base?",
        answer:
          "No. SVATE is intentionally designed around simplicity. A polished base can be achieved with a few well-chosen products rather than a long routine.",
      },
      {
        question: "What is the simplest SVATE base routine?",
        answer:
          "Prep your skin, apply your complexion product in a thin layer, build coverage only where needed, add your preferred cheek/eye/lip products and set strategically if required.",
      },
      {
        question: "How much complexion product should I use?",
        answer:
          "Start with a small amount and build gradually. Thin layers usually look more natural and help prevent a heavy or cakey finish.",
      },
      {
        question: "Why does my base look cakey?",
        answer:
          "Too much product, too much powder, insufficient skin preparation, incompatible skincare or applying layers too quickly can contribute. Start with less and build slowly.",
      },
      {
        question: "How do I make my base look natural?",
        answer:
          "Choose the correct undertone, prep your skin, use thin layers and blend around the jawline and edges. The right shade can make a bigger difference than adding more product.",
      },
      {
        question: "Can I use SVATE makeup without primer?",
        answer:
          "Yes, unless a particular product specifically recommends a primer. Good skin preparation can be enough for many makeup looks.",
      },
    ],
  },
  {
    id: "lips",
    title: "5. Lip Makeup",
    items: [
      {
        question: "How do I choose the right nude lipstick?",
        answer:
          "Consider your skin depth and undertone. Warm skin may suit warm beige, caramel, peach or brown-based nudes; cool skin may suit rosy, mauve or cooler brown nudes; neutral skin can work across both; olive skin often suits muted, balanced or earthy nudes.",
      },
      {
        question: "Why does the same lipstick look different on me?",
        answer:
          "Natural lip pigmentation, skin tone, undertone, lighting and amount of product can all affect the final colour.",
      },
      {
        question: "How can I make lipstick last longer?",
        answer:
          "Apply to clean, dry lips, use a thin even layer and allow it to set.",
      },
    ],
  },
  {
    id: "eyes",
    title: "6. Eye Makeup",
    items: [
      {
        question: "How do I prevent eyeliner from smudging?",
        answer:
          "Apply to clean, dry skin, avoid excess skincare directly around the lash line and allow the formula to set.",
      },
      {
        question: "Can I use every SVATE eye product on my waterline?",
        answer:
          "Only use a product on the waterline when its product instructions specifically state that it is suitable for that area.",
      },
      {
        question: "Can I share eye makeup?",
        answer:
          "For hygiene reasons, it is best not to share eye products, especially mascara and products that directly contact the eyes.",
      },
    ],
  },
  {
    id: "application-hygiene",
    title: "7. Makeup Application & Hygiene",
    items: [
      {
        question: "Can I apply SVATE makeup with my fingers?",
        answer:
          "Yes, where appropriate for the product. Clean fingers can work well for many cream and complexion products.",
      },
      {
        question: "Brush or sponge — which is better?",
        answer:
          "Both can work. Brushes can give targeted application and buildable coverage, while a damp sponge can create a softer, blended finish.",
      },
      {
        question: "What if a product irritates my skin?",
        answer:
          "Stop using it if you experience irritation or discomfort. If the reaction is significant or persistent, seek advice from a qualified healthcare professional.",
      },
      {
        question: "Should I patch test a new product?",
        answer:
          "If you have sensitive skin or are trying a new formula, a small-area patch test can be a sensible precaution.",
      },
    ],
  },
  {
    id: "orders",
    title: "8. Orders & Payments",
    items: [
      {
        question: "How do I place an order?",
        answer:
          "Choose your product and shade, add it to your cart, enter your delivery details and complete checkout using the payment methods available on the SVATE website.",
      },
      {
        question: "Can I cancel or change my order?",
        answer:
          "Prepaid orders can be cancelled free of charge before dispatch, typically within a few hours of ordering, for a full refund. At delivery you can decline a COD order at no charge, or decline a prepaid order and we'll refund once it returns to us.",
      },
      {
        question: "What if I receive the wrong product or shade?",
        answer:
          "Contact us within 24 hours with an unboxing photo/video. We'll send a full refund or free replacement — your choice. Return shipping is on us.",
      },
      {
        question: "What if something is missing from my order?",
        answer:
          "Same as a wrong or damaged item — full refund or replacement, no cost to you. Contact us within 24 hours with an unboxing photo/video.",
      },
    ],
  },
  {
    id: "shipping",
    title: "9. Shipping & Delivery",
    items: [
      {
        question: "Where does SVATE ship?",
        answer:
          "SVATE ships to locations that are shown as serviceable at checkout. Availability can vary by pin code and courier coverage.",
      },
      {
        question: "How long does delivery take?",
        answer:
          "Delivery times vary by location, courier capacity, weekends, holidays and other operational factors. Please refer to the Shipping Policy and the delivery estimate shown at checkout.",
      },
      {
        question: "How do I track my order?",
        answer:
          "Once your order is dispatched, tracking details will be shared through the contact information provided at checkout, where applicable.",
      },
      {
        question: "What if my order is delayed?",
        answer:
          "Check the tracking information first. If the shipment remains unresolved, contact SVATE customer support.",
      },
      {
        question: "What if my package arrives damaged?",
        answer:
          "Photograph the outer package, shipping label and damaged product before disposing of anything. Contact us within 24 hours with an unboxing photo/video for a full refund or free replacement — return shipping is on us.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Please refer to the Shipping Policy and the information displayed at checkout for the current free-shipping threshold and applicable conditions.",
      },
    ],
  },
  {
    id: "returns",
    title: "10. Returns, Refunds & Exchanges",
    items: shippingReturnsItems,
  },
  {
    id: "promotions",
    title: "11. Discounts & Promotions",
    items: [
      {
        question: "Can I use more than one discount code?",
        answer:
          "Discount stacking depends on the terms of the individual promotion. Checkout will indicate whether offers can be combined.",
      },
      {
        question: "What if my discount code does not work?",
        answer:
          "Check the code, expiry date, minimum order value and product exclusions. If the issue continues, contact support before completing the order.",
      },
      {
        question: "Can discounted products be returned?",
        answer:
          "Discounted products remain subject to the applicable return, refund and exchange rules unless the promotion specifically states otherwise.",
      },
    ],
  },
  {
    id: "support",
    title: "12. Customer Support",
    items: [
      {
        question: "How do I contact SVATE?",
        answer:
          "Use the customer-support details shown on the SVATE website, Contact Us page, order confirmation or product packaging.",
      },
      {
        question: "What should I include in a support request?",
        answer:
          "Include your order number, registered email/phone number, a clear description of the issue and photographs/videos where relevant.",
      },
      {
        question: "How quickly will SVATE respond?",
        answer:
          "Response times may vary with query volume, weekends, holidays and the complexity of the request.",
      },
    ],
  },
  {
    id: "policies",
    title: "Policy & Website Quick Links",
    items: [
      {
        question: "Shipping Policy",
        answer:
          "Please refer to the Shipping Policy for delivery timelines, serviceable locations, shipping charges, tracking and related delivery terms.",
      },
      {
        question: "Refund & Returns",
        answer:
          "See Shipping & Returns: 7 days from delivery. Damaged, defective, wrong or missing items reported within 24 hours get a full refund or free replacement. Unused, unopened products may be exchanged once within 7 days.",
      },
      {
        question: "Exchange Policy",
        answer:
          "See Shipping & Returns: one unused, unopened exchange within 7 days of delivery. Wrong shade sent by SVATE is a free replacement or refund. Shade-preference exchanges may include shipping charges depending on eligibility.",
      },
      {
        question: "Privacy Policy",
        answer:
          "Please refer to the Privacy Policy for information about collection, use, storage and protection of customer information.",
      },
      {
        question: "Terms & Conditions",
        answer:
          "Please refer to the Terms & Conditions for the terms governing purchases, website use, promotions and services.",
      },
    ],
  },
];

export const faqNav = [
  { id: "about-svate", label: "About SVATE" },
  { id: "skin-tone-undertone", label: "Skin Tone & Undertone" },
  { id: "shade-finder", label: "Shade Finder" },
  { id: "easy-base", label: "Easy Flawless Base" },
  { id: "lips", label: "Lips" },
  { id: "eyes", label: "Eyes" },
  { id: "application-hygiene", label: "Application & Hygiene" },
  { id: "orders", label: "Orders" },
  { id: "shipping", label: "Shipping" },
  { id: "returns", label: "Returns & Refunds" },
  { id: "returns", label: "Exchanges" },
  { id: "promotions", label: "Promotions" },
  { id: "support", label: "Customer Support" },
  { id: "policies", label: "Policies" },
] as const;
