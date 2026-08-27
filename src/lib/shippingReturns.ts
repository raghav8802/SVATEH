export type ShippingReturnItem = {
  question: string;
  answer: string;
  bullets?: string[];
  email?: string;
};

export const shippingReturnsIntro = {
  eyebrow: "Returns, Refunds & Exchanges",
  title: "Shipping & Returns",
  promise:
    "We want you to find your SVATE shade. Check our Warm • Cool • Neutral • Olive shade guide before you buy — and if something's still off, here's how we help.",
};

export const shippingReturnsItems: ShippingReturnItem[] = [
  {
    question: "How long do I have to return or report an issue?",
    answer: "7 days from the date of delivery.",
  },
  {
    question: "I received a damaged, defective, or wrong product. What now?",
    answer:
      "Contact us within 24 hours with an unboxing photo/video, and we'll send a full refund or free replacement — your choice. Return shipping is on us.",
  },
  {
    question: "A product is missing from my order.",
    answer: "Same as above — full refund or replacement, no cost to you.",
  },
  {
    question: "SVATE sent me the wrong shade.",
    answer: "Free replacement or refund. Return shipping is on us.",
  },
  {
    question: "I ordered the wrong shade for myself — can I exchange it?",
    answer:
      "Yes, one time, as long as the product is unused, unopened, and in original packaging, within 7 days of delivery. (Applicable shipping charges may apply depending on eligibility — we'll confirm this when you raise the request.)",
  },
  {
    question:
      "I swatched the product on my hand and the undertone is wrong — can I still exchange it?",
    answer:
      "Since it's technically opened, this falls outside our standard return policy. That said, we often offer a one-time goodwill exchange or store credit — reach out with a photo of the swatch and we'll help you find your match.",
  },
  {
    question: "I used the product and just don't like it — can I return it?",
    answer:
      "Unfortunately no. Once makeup is opened and used (beyond a swatch), we can't accept returns or exchanges for change of mind or preference — this is a hygiene and safety standard across cosmetics.",
  },
  {
    question: "Can I cancel my order?",
    answer: "",
    bullets: [
      "Prepaid, within a few hours of ordering: Yes, free cancellation before dispatch, full refund.",
      "COD order, at delivery: Just decline the delivery — nothing was charged, so there's nothing to refund.",
      "Prepaid order, at delivery: Decline the delivery; once it's back with us, we'll refund your original payment method.",
    ],
  },
  {
    question:
      "I didn't accept my prepaid order and it got RTO'ed (returned to origin) — what happens?",
    answer:
      "Once it reaches our warehouse, we'll automatically initiate your refund. Note: repeated non-acceptance may move your account to COD-only for future orders.",
  },
  {
    question: "How long do refunds take?",
    answer:
      "We initiate refunds within 3-5 business days of approval. Actual credit to your account depends on your bank/payment provider's own processing time.",
  },
  {
    question: "I paid via COD — how do I get refunded?",
    answer:
      "Through a method we provide at the time, typically bank transfer or UPI.",
  },
  {
    question: "Can I return a free gift or promotional item?",
    answer:
      "Generally no, unless the specific promotion says otherwise or the law requires it. If you return the paired product, the gift's value may be deducted from your refund.",
  },
  {
    question: "Who pays for return shipping?",
    answer:
      "If the issue is ours (damaged, defective, wrong item/shade, missing item) — we cover it. If it's a shade-preference exchange on your end, shipping charges may apply depending on eligibility.",
  },
  {
    question: "How do I start a return, exchange, or cancellation?",
    answer:
      "Email/message us at hello@svateh.in with your order ID and photos where relevant — we'll take it from there.",
    email: "hello@svateh.in",
  },
];
