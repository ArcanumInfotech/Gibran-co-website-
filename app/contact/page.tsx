import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ContactView } from "@/components/contact/contact-view";

export const metadata: Metadata = {
  title: "Contact Us & Concierge | Gibran & Co.",
  description:
    "Connect with Gibran & Co. regional concierge for table reservations, private culinary salon inquiries, and hospitality across Bahrain, Abu Dhabi, and Beirut.",
  keywords: [
    "Contact Gibran & Co.",
    "Table Reservations Concierge",
    "Adliya Bahrain Fine Dining Hotline",
    "Private Dining Inquiries",
    "Gibran Hospitality",
  ],
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main">
        <ContactView />
      </main>
      <Footer />
    </>
  );
}
