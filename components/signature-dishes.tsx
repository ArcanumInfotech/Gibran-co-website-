"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { signatureDishes } from "@/lib/data";
import { subscribeToFirebaseMenu, MenuDataState } from "@/lib/firebase-menu";
import { EASE_EDITORIAL, SplitText } from "@/components/motion-primitives";
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from "@/components/icons";

export function SignatureDishes() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(4);
  const [menuState, setMenuState] = useState<MenuDataState | null>(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Real-time synchronization directly with Firebase Firestore / Admin updates
  useEffect(() => {
    const unsubscribe = subscribeToFirebaseMenu((updated) => {
      if (updated && Array.isArray(updated.groups)) {
        setMenuState(updated);
      }
    });
    return () => unsubscribe();
  }, []);

  // Prefer live dishes from API:
  const displayDishes = useMemo(() => {
    if (!menuState || !menuState.items || menuState.items.length === 0) {
      return signatureDishes;
    }
    const currency = menuState.brand?.currency || "AED";
    // Sort dishes by dmOrder (or order)
    const sorted = [...menuState.items].sort((a, b) => {
      const orderA = a.dmOrder !== null && a.dmOrder !== undefined ? a.dmOrder : parseInt(a.id, 10) || 999;
      const orderB = b.dmOrder !== null && b.dmOrder !== undefined ? b.dmOrder : parseInt(b.id, 10) || 999;
      return orderA - orderB;
    });

    return sorted.map((it) => {
      let tag = it.badge || "Specialty";
      if (it.rawDietary?.isSpicy) tag = "Spicy";
      else if (it.rawDietary?.isVeg) tag = "Vegetarian";
      else if (it.isSignature) tag = "Signature";

      return {
        id: it.id,
        name: it.name,
        description: it.description || `Freshly prepared ${it.name} made to order.`,
        price: `${currency} ${Number(it.price).toFixed(2)}`,
        image: it.image || "/images/dish-chicken.jpg",
        tag,
      };
    });
  }, [menuState]);

  /* How many cards fit at the current breakpoint. */
  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      setPerView(width < 640 ? 1 : width < 1024 ? 2 : 4);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const maxIndex = Math.max(0, displayDishes.length - perView);

  const scrollToCard = useCallback(
    (next: number) => {
      const clamped = Math.min(maxIndex, Math.max(0, next));
      setIndex(clamped);
      const track = trackRef.current;
      if (!track) return;
      const card = track.children[clamped] as HTMLElement | undefined;
      if (!card) return;
      const paddingLeft = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
      track.scrollTo({ left: Math.max(0, card.offsetLeft - paddingLeft), behavior: "smooth" });
    },
    [maxIndex]
  );

  // Auto-scroll through dishes seamlessly with pause on hover/interaction
  useEffect(() => {
    if (!isAutoPlay || isHovered || maxIndex <= 0) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setIndex((curr) => {
        const next = curr >= maxIndex ? 0 : curr + 1;
        const track = trackRef.current;
        if (track) {
          const card = track.children[next] as HTMLElement | undefined;
          if (card) {
            const paddingLeft = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
            track.scrollTo({ left: Math.max(0, card.offsetLeft - paddingLeft), behavior: "smooth" });
          }
        }
        return next;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, maxIndex]);

  // Sync carousel active index on touch swipe
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timer: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const paddingLeft = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
        const scrollLeft = track.scrollLeft;
        const cards = Array.from(track.children) as HTMLElement[];
        if (cards.length === 0) return;

        let closest = 0;
        let minDiff = Infinity;
        cards.forEach((c, i) => {
          const target = c.offsetLeft - paddingLeft;
          const diff = Math.abs(scrollLeft - target);
          if (diff < minDiff) {
            minDiff = diff;
            closest = i;
          }
        });
        setIndex(Math.min(maxIndex, Math.max(0, closest)));
      }, 60);
    };
    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      track.removeEventListener("scroll", handleScroll);
    };
  }, [maxIndex]);

  /* Arrow-key support while the carousel has focus. */
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollToCard(index >= maxIndex ? 0 : index + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollToCard(index <= 0 ? maxIndex : index - 1);
    }
  };

  return (
    <section
      id="signature"
      className="grain relative w-full max-w-full overflow-hidden scroll-mt-20 lg:scroll-mt-24 border-b border-[#ECE7DC] bg-[#FAF7F0] py-16 sm:py-20 lg:py-24"
    >
      <div className="shell">
        {/* Header */}
        <div className="mb-8 sm:mb-12 flex flex-wrap items-end justify-between gap-4 sm:gap-6">
          <div>
            <motion.span
              className="eyebrow mb-2"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE_EDITORIAL }}
            >
              Artisanal Flavors
            </motion.span>
            <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-normal leading-tight text-oliveDark">
              <SplitText text="Our Signature Dishes" as="span" />
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={isAutoPlay ? "Pause auto-scroll" : "Start auto-scroll"}
              title={isAutoPlay ? "Pause auto-scroll" : "Start auto-scroll"}
              onClick={() => setIsAutoPlay((prev) => !prev)}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-oliveDark/20 text-oliveDark transition-all duration-300 ease-editorial hover:border-[#6d7835] hover:bg-[#6d7835] hover:text-white"
            >
              {isAutoPlay ? (
                <PauseIcon className="h-3.5 w-3.5 fill-current" />
              ) : (
                <PlayIcon className="h-3.5 w-3.5 fill-current ml-0.5" />
              )}
            </button>
            <CarouselButton
              label="Previous dishes"
              onClick={() => scrollToCard(index <= 0 ? maxIndex : index - 1)}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </CarouselButton>
            <CarouselButton
              label="Next dishes"
              onClick={() => scrollToCard(index >= maxIndex ? 0 : index + 1)}
            >
              <ArrowRightIcon className="h-4 w-4" />
            </CarouselButton>
          </div>
        </div>

        {/* Track with hover & touch pauses */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsHovered(false), 2000);
          }}
          className="relative"
        >

          {/* Track */}
          <div
            ref={trackRef}
            role="region"
            aria-roledescription="carousel"
            aria-label="Signature dishes"
            tabIndex={0}
            onKeyDown={onKeyDown}
            className="-mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden px-6 pb-4 outline-none scroll-smooth lg:-mx-12 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain overscroll-y-none"
            style={{ touchAction: "pan-x pan-y" }}
          >
            {displayDishes.map((dish, i) => (
              <motion.div
                key={dish.id + i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${displayDishes.length}`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: EASE_EDITORIAL }}
                className="flex w-[calc(100vw-3rem)] shrink-0 snap-start flex-col sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
              >
                <Link
                  href={`/menu?category=signatures&dish=${dish.id}`}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-[#ECE7DC] bg-white p-4 dish-shadow transition-all duration-500 ease-editorial hover:shadow-[0_18px_30px_-8px_rgba(28,36,27,0.14)] hover:border-[#D5CDBC] cursor-pointer"
                  title={`View ${dish.name} in Menu`}
                >
                  <div>
                    <div className="relative mb-3 sm:mb-4 h-40 xs:h-44 sm:h-52 w-full overflow-hidden rounded-xl bg-sand select-none">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        draggable={false}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, calc(100vw - 3rem)"
                        className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105 pointer-events-none select-none"
                      />
                      <AnimatePresence>
                        {dish.tag && (
                          <motion.span
                            initial={{ opacity: 0, y: -8 }}
                            variants={{ hover: { opacity: 1, y: 0 } }}
                            transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
                            className="absolute left-3 top-3 rounded-full bg-[#FAF8F5]/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-oliveDark backdrop-blur-sm"
                          >
                            {dish.tag}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <h3 className="font-serif text-xl font-semibold leading-snug text-oliveDark transition-colors group-hover:text-[#6d7835]">
                        {dish.name}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-oliveMuted">
                        {dish.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#F0ECE1] pt-3">
                    <span className="font-sans text-base sm:text-lg font-bold tabular-nums tracking-normal text-oliveDark">
                      {dish.price.startsWith("AED") ? dish.price : `AED ${dish.price.replace("$", "")}`}
                    </span>
                    <span
                      className="group/order inline-flex items-center gap-1.5 rounded-full bg-[#6d7835] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all duration-300 group-hover:bg-[#5b642c]"
                    >
                      Order
                      <ArrowRightIcon className="h-3 w-3 transition-transform duration-500 ease-editorial group-hover/order:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress rail */}
        {maxIndex > 0 && (
          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#ECE7DC]">
              <motion.div
                className="h-full origin-left bg-warmGold"
                animate={{ scaleX: maxIndex === 0 ? 1 : (index + 1) / (maxIndex + 1) }}
                transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
              />
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-oliveMuted">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(maxIndex + 1).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function CarouselButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-oliveDark/20 text-oliveDark transition-all duration-300 ease-editorial hover:border-[#6d7835] hover:bg-[#6d7835] hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      <span className="transition-transform duration-500 ease-editorial group-hover:-translate-x-0.5 group-active:scale-90">
        {children}
      </span>
    </button>
  );
}
