import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | SVATEH",
  description: "Get in touch with SVATEH. We'd love to hear from you.",
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-[#E9DDCF]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <h1 className="font-serif text-4xl font-medium uppercase tracking-wide text-svateh-espresso lg:text-6xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-sans text-sm text-svateh-espresso/80 md:text-base">
            Questions about shades, orders, or collaborations? We&apos;re here
            for you.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <h2 className="font-serif text-3xl text-svateh-espresso">
            Get in Touch
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-svateh-mocha md:text-base">
            Reach out and our team will get back to you within 1–2 business
            days. Pamper yourself — the world can wait.
          </p>

          <ul className="mt-10 space-y-6">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-svateh-gold" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-svateh-espresso">
                  Email
                </p>
                <a
                  href="mailto:hello@svateh.in"
                  className="mt-1 text-sm text-svateh-mocha transition-colors hover:text-svateh-gold"
                >
                  hello@svateh.in
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-svateh-gold" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-svateh-espresso">
                  Phone
                </p>
                <a
                  href="tel:+919876543210"
                  className="mt-1 text-sm text-svateh-mocha transition-colors hover:text-svateh-gold"
                >
                  +91 98765 43210
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-svateh-gold" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-svateh-espresso">
                  Studio
                </p>
                <p className="mt-1 text-sm text-svateh-mocha">Mumbai, India</p>
              </div>
            </li>
          </ul>
        </div>

        <form className="space-y-5 rounded-2xl border border-[#E9DDCF]/50 bg-white p-6 shadow-luxury sm:p-8">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-svateh-espresso"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-[#E9DDCF] bg-svateh-ivory px-4 py-3 text-sm text-svateh-espresso placeholder:text-svateh-taupe focus:border-svateh-gold focus:outline-none focus:ring-1 focus:ring-svateh-gold"
              placeholder="Your name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-svateh-espresso"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-[#E9DDCF] bg-svateh-ivory px-4 py-3 text-sm text-svateh-espresso placeholder:text-svateh-taupe focus:border-svateh-gold focus:outline-none focus:ring-1 focus:ring-svateh-gold"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-svateh-espresso"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full resize-y rounded-xl border border-[#E9DDCF] bg-svateh-ivory px-4 py-3 text-sm text-svateh-espresso placeholder:text-svateh-taupe focus:border-svateh-gold focus:outline-none focus:ring-1 focus:ring-svateh-gold"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-[#C8A66A] py-3.5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-[#b89559]"
          >
            Send Message
          </button>
        </form>
      </section>
    </>
  );
}
