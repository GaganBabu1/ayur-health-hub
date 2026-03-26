import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-foreground/10">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="font-serif text-xl font-semibold">E-Ayurveda</span>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Intelligent health recommendations based on ancient Ayurvedic wisdom combined with modern AI technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/knowledge-base" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li className="text-sm text-primary-foreground/80">Online Consultation</li>
              <li className="text-sm text-primary-foreground/80">AI Health Analysis</li>
              <li className="text-sm text-primary-foreground/80">Ayurvedic Remedies</li>
              <li className="text-sm text-primary-foreground/80">Lifestyle Guidance</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                support@e-ayurveda.com
              </li>
              <li className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                +91 1234 567 890
              </li>
              <li className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Wellness Street,<br />Health City, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} E-Ayurveda Health System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
