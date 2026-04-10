import { BookMarkedIcon } from 'lucide-react';
import Link from 'next/link';
import { 
  WhatsappIcon, 
  FacebookIcon, 
  InstagramIcon, 
  YoutubeIcon 
} from '@/components/icons/SocialIcons'; 

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 font-bold text-foreground text-lg"
            >
              <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <BookMarkedIcon className="size-4" />
              </div>
              MaLibrary
            </Link>
            <p className="text-sm text-muted-foreground">
              Your perfect study space
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-foreground">Explore</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link href="/facilities" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Facilities</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
            </nav>
          </div>

          {/* Links Column 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-foreground">Support</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/contact-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQs</Link>
              <Link href="/rules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Policies</Link>
            </nav>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-semibold text-foreground">Action</h4>
            <nav className="flex flex-col gap-2">
              <Link 
                href="/inquiry" 
                className="text-sm text-primary hover:underline font-medium"
              >
                Reserve Seat
              </Link>
              <Link 
                href="/login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mb-8" />

        {/* Bottom */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} MaLibrary. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a href="https://wa.me/yournumber" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <WhatsappIcon className="size-4" />
            </a>
            <a href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <InstagramIcon className="size-4" />
            </a>
            <a href="https://facebook.com/yourpage" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <FacebookIcon className="size-4" />
            </a>
            <a href="https://youtube.com/yourchannel" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <YoutubeIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;