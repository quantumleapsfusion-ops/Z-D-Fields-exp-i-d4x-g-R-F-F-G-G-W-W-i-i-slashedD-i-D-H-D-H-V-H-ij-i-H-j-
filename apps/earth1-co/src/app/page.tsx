import { Equations } from "@/components/Equations";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { Nav } from "@/components/Nav";
import { Philosophy } from "@/components/Philosophy";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <Mission />
        <Equations />
        <Philosophy />
      </main>
      <Footer />
    </div>
  );
}
