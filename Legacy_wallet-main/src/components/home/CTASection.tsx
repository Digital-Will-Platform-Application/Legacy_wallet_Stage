import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const CTASection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-12 md:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-sage/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-sm font-medium text-foreground mb-6">
            <Shield className="w-4 h-4 text-gold" />
            {t("cta.startFree")}
          </div>

          <h2 className="heading-display text-foreground mb-6">
            {t("cta.readyToSecure")}
          </h2>

          <p className="body-large mb-8 max-w-xl mx-auto">
            {t("cta.joinThousands")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button variant="hero" size="xl" className="gap-2">
                {t("cta.createWillNow")}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/learn-more">
              <Button variant="hero-outline" size="xl">
                {t("cta.learnMore")}
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            {t("cta.noCreditCard")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
