"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-start"
        >
          <h1 className="font-serif text-4xl leading-tight tracking-tight text-svate-espresso sm:text-5xl lg:text-6xl">
            Pamper Yourself.
            <br />
            The World Can Wait.
          </h1>
          <p className="mt-5 max-w-md text-base text-svate-mocha sm:text-lg">
            Minimal steps. Maximum you.
          </p>
          <Link
            href="/collections"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#C8A66A] px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-white shadow-gold transition-opacity hover:opacity-90"
          >
            Shop Now
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-luxury-lg"
        >
          <Image
            src="https://images.unsplash.com/photo-1596704017254-9b121068ec31?q=80&w=1200&auto=format&fit=crop"
            alt="SVATE beauty model portrait"
            fill
            priority
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
