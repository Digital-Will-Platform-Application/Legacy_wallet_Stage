import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <span className="font-serif text-xl font-semibold">
                Digital Will
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-serif font-semibold mb-4">{t("footer.product")}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/how-it-works" className="hover:text-gold transition-colors">{t("footer.howItWorks")}</Link></li>
              <li><Link to="/pricing" className="hover:text-gold transition-colors">{t("footer.pricing")}</Link></li>
              <li><Link to="/features" className="hover:text-gold transition-colors">{t("footer.features")}</Link></li>
              <li><Link to="/security" className="hover:text-gold transition-colors">{t("footer.security")}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif font-semibold mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-gold transition-colors">{t("footer.aboutUs")}</Link></li>
              <li><Link to="/blog" className="hover:text-gold transition-colors">{t("footer.blog")}</Link></li>
              <li><Link to="/careers" className="hover:text-gold transition-colors">{t("footer.careers")}</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">{t("footer.contact")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-serif font-semibold mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li><Link to="/privacy" className="hover:text-gold transition-colors">{t("footer.privacyPolicy")}</Link></li>
              <li><Link to="/terms" className="hover:text-gold transition-colors">{t("footer.termsOfService")}</Link></li>
              <li><Link to="/gdpr" className="hover:text-gold transition-colors">{t("footer.gdprCompliance")}</Link></li>
              <li><Link to="/accessibility" className="hover:text-gold transition-colors">{t("footer.accessibility")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <p className="text-sm text-primary-foreground/60">
            {t("footer.allRightsReserved", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
