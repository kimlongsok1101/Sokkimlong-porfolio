import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import PayCoffeeMe from "@/components/PayCoffeeMe";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import MatrixRainWrapper from "@/components/MatrixRainWrapper";

// Force Next.js to treat this page as dynamic so updates and WebSockets flow instantly without caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Home() {
  return (
    <main className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen relative overflow-x-hidden transition-colors duration-300">
      {/* Background Effect */}
      <MatrixRainWrapper />

      {/* Main Page Content */}
      <div className="relative z-10">
        <Navbar />
        <HomeHero />
        <About />
        <Skills />
        <Projects />
        <PayCoffeeMe />
        <Contact />
        <Footer />
      </div>
    </main>
  );
}