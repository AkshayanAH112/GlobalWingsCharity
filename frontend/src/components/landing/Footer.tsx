import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const footerLinks = {
  programs: [
    { name: "Free Education", href: "#programs" },
    { name: "Disaster Relief", href: "#programs" },
    { name: "Community Support", href: "#programs" },
    { name: "Volunteer", href: "#contact" },
  ],
  company: [
    { name: "About Us", href: "#about" },
    { name: "Our Impact", href: "#impact" },
    { name: "Contact", href: "#contact" },
    { name: "Donate", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-navy-dark text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#home" className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Global Wings Charity" className="h-10 w-10 object-contain" />
              <div className="flex flex-col leading-tight">
                <span className="font-heading text-xl font-bold">
                  Global Wings <span className="text-secondary">Charity</span>
                </span>
                <span className="text-xs text-primary-foreground/60">Create a better future</span>
              </div>
            </a>
            <p className="text-primary-foreground/70 mb-6 leading-relaxed">
              Empowering lives through education, disaster relief, and community support. 
              Together, we can make a difference.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Our Programs</h4>
            <ul className="space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/70 hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-6">Stay Updated</h4>
            <p className="text-primary-foreground/70 mb-4">
              Subscribe to our newsletter for updates on our programs and impact.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-gold-dark transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/60 text-sm">
            © 2026 Global Wings Charity. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-primary-foreground/60 hover:text-secondary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
