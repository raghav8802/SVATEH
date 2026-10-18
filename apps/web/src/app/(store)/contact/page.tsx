import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@svateh/db";
import { ContactForm } from "@/components/store/forms";
import { PageHero } from "@/components/store/ui";

export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const s = await getSettings();
  const { order } = await searchParams;
  const row = "flex gap-4 border-b border-ink/10 py-5";
  return (
    <>
      <PageHero eyebrow="Contact" title="We’re here to help." intro="Questions about shades, an order or anything else — send us a note." tone="cream" />
      <section className="container-x grid gap-12 pb-20 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {s.contactEmail ? (
            <div className={row}>
              <Mail className="mt-1 h-5 w-5 text-gold" />
              <div>
                <p className="eyebrow !text-violet">Email</p>
                <a href={`mailto:${s.contactEmail}`} className="font-display text-xl hover:text-violet">{s.contactEmail}</a>
              </div>
            </div>
          ) : null}
          {s.whatsapp ? (
            <div className={row}>
              <MessageCircle className="mt-1 h-5 w-5 text-gold" />
              <div>
                <p className="eyebrow !text-violet">WhatsApp</p>
                <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-display text-xl hover:text-violet">Chat with us</a>
              </div>
            </div>
          ) : null}
          {s.phone ? (
            <div className={row}>
              <Phone className="mt-1 h-5 w-5 text-gold" />
              <div>
                <p className="eyebrow !text-violet">Phone</p>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="font-display text-xl hover:text-violet">{s.phone}</a>
              </div>
            </div>
          ) : null}
          {s.supportHours || s.responseTime ? (
            <div className={row}>
              <Clock className="mt-1 h-5 w-5 text-gold" />
              <div>
                <p className="eyebrow !text-violet">Hours</p>
                <p className="text-sm">{s.supportHours}</p>
                {s.responseTime ? <p className="text-sm text-ink/60">Response time: {s.responseTime}</p> : null}
              </div>
            </div>
          ) : null}
          {s.address ? (
            <div className={row}>
              <MapPin className="mt-1 h-5 w-5 text-gold" />
              <p className="text-sm whitespace-pre-line">{s.address}</p>
            </div>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link href="/faq" className="underline">Read the FAQs</Link>
            <Link href="/track" className="underline">Track an order</Link>
            <Link href="/returns-policy" className="underline">Returns</Link>
          </div>
        </div>
        <ContactForm defaultOrder={order} />
      </section>
    </>
  );
}
