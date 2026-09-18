import Navbar from '@/components/Navbar';
import BackgroundVideo from '@/components/BackgroundVideo';
import Footer from '@/components/Footer';
import '@/styles/hero.css';

export default function HeroSection() {
  return (
    <div className="hero">
      <Navbar />
      <BackgroundVideo />
      <Footer />
    </div>
  );
}
