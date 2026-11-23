import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MenuContent } from "@/components/menu/menu-content";
import { getRestaurantMenuState } from "@/lib/rms-menu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Our Menu · GIBRAN & CO.",
  description:
    "A curated selection of authentic flavors and chef creations.",
};

export default async function MenuPage() {
  let initialMenuState = null;
  try {
    initialMenuState = await getRestaurantMenuState();
  } catch (err) {
    console.warn("SSR RMS menu load notice:", err);
  }

  return (
    <>
      <Header />
      <main className="grain relative min-h-screen bg-[#FAF7F0] pt-6 pb-24">
        <Suspense fallback={<div className="min-h-screen" />}>
          <MenuContent initialMenuState={initialMenuState} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
