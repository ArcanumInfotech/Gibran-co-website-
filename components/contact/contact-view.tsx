"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { OliveBranchBotanical } from "@/components/olive-branch-botanical";
import { EASE_EDITORIAL, usePrefersReducedMotion } from "@/components/motion-primitives";
import { restaurantLocations } from "@/lib/data";
import {
  ClockIcon,
  HeartIcon,
  PhoneIcon,
  WhatsAppIcon,
  PinIcon,
  ArrowRightIcon,
  NavigationIcon,
} from "@/components/icons";

export function ContactView() {
  const reduced = usePrefersReducedMotion();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    inquiryType: "Table Reservation",
    message: "",
  });

  const [submittedData, setSubmittedData] = useState<typeof formData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const snapshot = { ...formData };
    setSubmittedData(snapshot);

    // Format message for WhatsApp
    const messageLines = [
      `*New Concierge Inquiry — Gibran & Co.*`,
      ``,
      `*Name:* ${snapshot.name}`,
      `*Phone:* ${snapshot.phone}`,
      `*Email:* ${snapshot.email}`,
      `*Inquiry Topic:* ${snapshot.inquiryType}`,
      ``,
      `*Message:*`,
      snapshot.message,
    ];
    const encodedText = encodeURIComponent(messageLines.join("\n"));
    const whatsappUrl = `https://wa.me/971565053149?text=${encodedText}`;

    setIsSubmitted(true);
    setIsSubmitting(false);

    // Direct top-level navigation to WhatsApp
    if (typeof window !== "undefined") {
      window.location.href = whatsappUrl;
    }
  };

  const contactCards = [
    {
      title: "WhatsApp Concierge",
      caption: "Instant WhatsApp Chat",
      value: "+971 56 505 3149",
      href: "https://wa.me/971565053149",
      icon: WhatsAppIcon,
      note: "Click to chat directly with guest concierge",
    },
    {
      title: "Direct Reservations",
      caption: "Telephone Hotline",
      value: "+971 56 505 3149",
      href: "tel:+971565053149",
      icon: PhoneIcon,
      note: "Available daily 11:00 AM – 11:00 PM",
    },
    {
      title: "Concierge Desk",
      caption: "Email Inquiries",
      value: "concierge@gibran.com",
      href: "mailto:concierge@gibran.com",
      icon: HeartIcon,
      note: "Inquiries responded to within 2 hours",
    },
    {
      title: "Dining Hours",
      caption: "Lunch & Dinner",
      value: "12:00 PM – 11:00 PM",
      icon: ClockIcon,
      note: "Open seven days a week across all houses",
    },
  ];

  return (
    <div className="relative w-full max-w-full overflow-hidden bg-[#FAF7F0] text-oliveDark">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO BANNER WITH BOTANICAL OLIVE ACCENTS
      ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[48vh] sm:min-h-[54vh] lg:min-h-[60vh] w-full overflow-hidden bg-[#182317] text-[#FAF7F0] flex flex-col justify-center">
        {/* Background image & gradient veil */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/reservation-dining.jpg"
            alt="Gibran & Co. dining ambiance"
            fill
            priority
            sizes="100vw"
            className="h-full w-full object-cover object-center opacity-35 brightness-75 scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#172316] via-[#172316]/85 to-[#172316]/50" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#182317] via-transparent to-[#182317]/60" />
        </div>

        {/* CASCADING BOTANICAL OLIVE BRANCH (softened) */}
        <motion.div
          animate={reduced ? undefined : { y: [0, 8, 0], rotate: [2, 3.5, 2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          className="pointer-events-none absolute top-[28%] -left-10 sm:-left-16 md:-left-20 lg:-left-24 z-0 select-none opacity-20 sm:opacity-30 md:opacity-40 transition-opacity duration-700"
        >
          <OliveBranchBotanical
            variant="cascade-left"
            className="w-32 h-[180px] sm:w-64 sm:h-[360px] md:w-[380px] md:h-[530px] lg:w-[460px] lg:h-[640px]"
          />
        </motion.div>

        <div className="shell relative z-20 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-4 sm:space-y-6">
            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
              className="inline-flex items-center justify-center gap-3"
            >
              <span className="h-px w-8 bg-warmGold" />
              <span className="eyebrow !text-warmGold tracking-[0.24em]">
                Concierge &amp; Inquiries
              </span>
              <span className="h-px w-8 bg-warmGold" />
            </motion.div>

            <motion.h1
              initial={reduced ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.15, ease: EASE_EDITORIAL }}
              className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight"
            >
              We Welcome You to Our <br />
              <span className="italic text-warmGold font-light">Levantine Houses</span>
            </motion.h1>

            <motion.p
              initial={reduced ? undefined : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.3, ease: EASE_EDITORIAL }}
              className="mx-auto max-w-2xl text-xs sm:text-base font-light leading-relaxed text-[#BCC6B8] tracking-wide"
            >
              Whether reserving a private dining salon, planning bespoke celebrations,
              or inquiring about culinary pairings across our houses in Bahrain, Abu Dhabi,
              and Beirut — our concierge is dedicated to your experience.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. QUICK CONTACT CARDS (WhatsApp, Tel, Email, Hours)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-30 -mt-8 sm:-mt-10 lg:-mt-12 px-4 sm:px-6 lg:px-8">
        <div className="shell">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={reduced ? undefined : { opacity: 0, y: 20 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: EASE_EDITORIAL }}
                  className="group relative flex flex-col justify-between rounded-2xl border border-[#ECE7DC] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(28,36,27,0.06)] transition-all duration-300 hover:border-warmGold/60 hover:shadow-[0_16px_36px_rgba(28,36,27,0.1)] hover:-translate-y-1"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF7F0] text-warmGold transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.2em] text-oliveMuted">
                      {card.caption}
                    </span>

                    <h3 className="mt-1 font-serif text-lg font-semibold text-oliveDark">
                      {card.title}
                    </h3>

                    {card.href ? (
                      <a
                        href={card.href}
                        target={card.href.startsWith("http") ? "_blank" : undefined}
                        rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="mt-2 block font-sans text-sm font-semibold text-[#6d7835] hover:text-[#5b642c] transition-colors"
                      >
                        {card.value}
                      </a>
                    ) : (
                      <p className="mt-2 font-sans text-sm font-semibold text-oliveDark">
                        {card.value}
                      </p>
                    )}
                  </div>

                  <p className="mt-4 border-t border-[#ECE7DC]/60 pt-3 text-[11px] font-light text-oliveMuted">
                    {card.note}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT: INQUIRY FORM & REGIONAL HOUSES
      ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-28">
        <div className="shell">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left: Concierge Inquiry Form (7 cols) */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, x: -24 }}
              whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, ease: EASE_EDITORIAL }}
              className="lg:col-span-7 rounded-3xl border border-[#ECE7DC] bg-white p-6 sm:p-10 shadow-[0_12px_40px_rgba(28,36,27,0.06)]"
            >
              <div className="mb-8">
                <span className="eyebrow !text-warmGold">Direct Inquiries</span>
                <h2 className="mt-2 font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-oliveDark">
                  Send a Message to the Concierge
                </h2>
                <p className="mt-2 text-xs sm:text-sm font-light text-oliveMuted leading-relaxed">
                  Please share your requirements below. For immediate same-day reservations,
                  we recommend contacting our WhatsApp hotline directly.
                </p>
              </div>

              {isSubmitted && submittedData ? (
                <div className="rounded-2xl border border-warmGold/40 bg-[#FAF7F0] p-6 sm:p-8 text-center space-y-5">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#6d7835] text-white text-2xl shadow-md">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-warmGold">
                      Concierge Confirmation
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-oliveDark mt-1">
                      Inquiry Received
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-oliveMuted leading-relaxed max-w-md mx-auto">
                    Thank you, <strong className="text-oliveDark font-semibold">{submittedData.name}</strong>.
                    Your message has been received and routed directly to our WhatsApp Concierge desk.
                  </p>

                  {/* Summary of submitted inquiry */}
                  <div className="rounded-xl border border-[#ECE7DC] bg-white p-4 text-left text-xs space-y-2 max-w-md mx-auto shadow-xs">
                    <div className="flex justify-between py-1 border-b border-[#F0ECE1]">
                      <span className="text-oliveMuted">Topic:</span>
                      <span className="font-medium text-oliveDark">{submittedData.inquiryType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F0ECE1]">
                      <span className="text-oliveMuted">Phone:</span>
                      <span className="font-medium text-oliveDark">{submittedData.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#F0ECE1]">
                      <span className="text-oliveMuted">Email:</span>
                      <span className="font-medium text-oliveDark">{submittedData.email}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-oliveMuted block mb-1">Message:</span>
                      <p className="text-oliveDark italic bg-[#FAF7F0] p-2.5 rounded-lg border border-[#ECE7DC]/60 whitespace-pre-wrap">
                        {submittedData.message}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Open in WhatsApp or Send another */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/971565053149?text=${encodeURIComponent(
                        `*New Concierge Inquiry — Gibran & Co.*\n\n*Name:* ${submittedData.name}\n*Phone:* ${submittedData.phone}\n*Email:* ${submittedData.email}\n*Inquiry Topic:* ${submittedData.inquiryType}\n\n*Message:*\n${submittedData.message}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#20ba59] hover:shadow-lg"
                    >
                      <WhatsAppIcon className="h-4 w-4 fill-white" />
                      <span>Chat on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          phone: "",
                          inquiryType: "Table Reservation",
                          message: "",
                        });
                        setSubmittedData(null);
                      }}
                      className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-[#DCD5C6] bg-white px-5 py-3 text-xs font-semibold uppercase tracking-wider text-oliveDark hover:bg-[#FAF7F0] transition-colors"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-oliveDark">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="E.g. Alexander Vance"
                        className="mt-1.5 w-full rounded-xl border border-[#DCD5C6] bg-white px-4 py-3 text-xs text-oliveDark placeholder-oliveMuted/60 transition-colors focus:border-[#6d7835] focus:outline-none focus:ring-1 focus:ring-[#6d7835]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-oliveDark">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alexander@domain.com"
                        className="mt-1.5 w-full rounded-xl border border-[#DCD5C6] bg-white px-4 py-3 text-xs text-oliveDark placeholder-oliveMuted/60 transition-colors focus:border-[#6d7835] focus:outline-none focus:ring-1 focus:ring-[#6d7835]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-oliveDark">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+971 56 505 3149"
                        className="mt-1.5 w-full rounded-xl border border-[#DCD5C6] bg-white px-4 py-3 text-xs text-oliveDark placeholder-oliveMuted/60 transition-colors focus:border-[#6d7835] focus:outline-none focus:ring-1 focus:ring-[#6d7835]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-oliveDark">
                        Inquiry Topic
                      </label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-[#DCD5C6] bg-white px-4 py-3 text-xs text-oliveDark transition-colors focus:border-[#6d7835] focus:outline-none focus:ring-1 focus:ring-[#6d7835]"
                      >
                        <option>Table Reservation</option>
                        <option>Private Dining &amp; Salons</option>
                        <option>Bespoke Event Hosting</option>
                        <option>Press &amp; Media Inquiries</option>
                        <option>General Concierge Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-oliveDark">
                      Message &amp; Requirements *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please mention preferred dates, party size, seating preference, or any bespoke requirements..."
                      className="mt-1.5 w-full rounded-xl border border-[#DCD5C6] bg-white px-4 py-3 text-xs text-oliveDark placeholder-oliveMuted/60 transition-colors focus:border-[#6d7835] focus:outline-none focus:ring-1 focus:ring-[#6d7835]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-[#6d7835] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all duration-300 hover:bg-[#5b642c] hover:shadow-lg active:scale-95 disabled:opacity-60"
                    >
                      <span>{isSubmitting ? "Transmitting..." : "Send Message"}</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-2 text-xs font-medium text-oliveMuted">
                      <WhatsAppIcon className="h-4 w-4 fill-[#25D366]" />
                      <span>Routes to WhatsApp Concierge</span>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>

            {/* Right: Regional Houses & Quick Actions (5 cols) */}
            <motion.div
              initial={reduced ? undefined : { opacity: 0, x: 24 }}
              whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, delay: 0.15, ease: EASE_EDITORIAL }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="rounded-3xl border border-[#ECE7DC] bg-[#FAF7F0] p-6 sm:p-8 space-y-6">
                <div>
                  <span className="eyebrow !text-warmGold">Our Houses</span>
                  <h3 className="mt-1 font-serif text-2xl font-normal text-oliveDark">
                    Regional Dining Houses
                  </h3>
                </div>

                <div className="divide-y divide-[#ECE7DC] space-y-5">
                  {restaurantLocations.map((loc, i) => (
                    <div key={loc.id} className={i > 0 ? "pt-5" : ""}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif text-lg font-semibold text-oliveDark">
                          {loc.city}
                        </h4>
                        {loc.badge && (
                          <span className="rounded-full bg-warmGold/15 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warmGold">
                            {loc.badge}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 flex items-start gap-2 text-xs font-light text-oliveMuted leading-relaxed">
                        <PinIcon className="h-3.5 w-3.5 text-warmGold shrink-0 mt-0.5" />
                        <span>{loc.address}</span>
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-medium">
                        <a
                          href={`tel:${loc.phone.replace(/[^0-9+]/g, "")}`}
                          className="font-sans font-semibold text-[#6d7835] hover:text-[#5b642c]"
                        >
                          {loc.phone}
                        </a>
                        <span className="text-[#C5BCAD]">•</span>
                        <a
                          href={loc.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-warmGold hover:underline"
                        >
                          <NavigationIcon className="h-3 w-3" />
                          <span>Get Directions</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#ECE7DC] pt-5">
                  <Link
                    href="/reservation"
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#1C241B] py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-300 hover:bg-[#6d7835]"
                  >
                    <span>Reserve a Table Online</span>
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
