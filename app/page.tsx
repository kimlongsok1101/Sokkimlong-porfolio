import Navbar from "@/components/Navbar";
import HomeHero from "@/components/HomeHero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import PayCoffeeMe from "@/components/PayCoffeeMe";
import MessageFeed from "@/components/MessageFeed";
import Contact from "@/components/Contact";
import MatrixRain from "@/components/MatrixRain"; // Or ParticleGrid

export default function Home() {
  return (
    <main className="bg-slate-950 text-slate-100 min-h-screen relative overflow-x-hidden">
      {/* Background Effect */}
      <MatrixRain />

      {/* Main Page Content */}
      <div className="relative z-10">
        <Navbar />
        <HomeHero />
        <About />
        <Skills />
        <Projects />
        <PayCoffeeMe />
        <MessageFeed />
        <Contact />
      </div>
    </main>
  );
}