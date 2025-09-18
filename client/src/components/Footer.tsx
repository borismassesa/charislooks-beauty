import { SiInstagram, SiFacebook, SiTiktok, SiYoutube } from 'react-icons/si'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="text-center sm:text-left">
            <p className="text-muted-foreground text-sm">
              © {currentYear} CharisLooks. All rights reserved.
            </p>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://instagram.com/charislooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-ring transition-colors duration-200"
              data-testid="link-instagram"
              aria-label="Follow us on Instagram"
            >
              <SiInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com/charislooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-ring transition-colors duration-200"
              data-testid="link-facebook"
              aria-label="Follow us on Facebook"
            >
              <SiFacebook className="h-5 w-5" />
            </a>
            <a
              href="https://tiktok.com/@charislooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-ring transition-colors duration-200"
              data-testid="link-tiktok"
              aria-label="Follow us on TikTok"
            >
              <SiTiktok className="h-5 w-5" />
            </a>
            <a
              href="https://youtube.com/@charislooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-ring transition-colors duration-200"
              data-testid="link-youtube"
              aria-label="Subscribe to our YouTube channel"
            >
              <SiYoutube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}