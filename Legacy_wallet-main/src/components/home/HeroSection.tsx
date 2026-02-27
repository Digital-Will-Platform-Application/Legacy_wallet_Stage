import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Lock, CheckCircle, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HeroSection = () => {
  const { t } = useTranslation();
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  const fullText = `${t("hero.yourLegacy")} ${t("hero.securedForever")}`;
  const goldText = t("hero.securedForever");
  const regularText = t("hero.yourLegacy");

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 100); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Split the displayed text to highlight the gold part
  const getDisplayedParts = () => {
    if (displayedText.length <= regularText.length) {
      return {
        regular: displayedText,
        gold: "",
      };
    }
    return {
      regular: regularText,
      gold: displayedText.slice(regularText.length + 1), // +1 for space
    };
  };

  const parts = getDisplayedParts();
  const trustBadges = [
    { icon: Lock, text: t("hero.endToEndEncrypted") },
    { icon: Shield, text: t("hero.gdprCompliant") },
    { icon: CheckCircle, text: t("hero.bankLevelSecurity") },
  ];

  return (
    <section className="relative min-h-[70vh] flex items-center pt-28 md:pt-32 pb-12 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-sage/20" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="max-w-4xl mx-auto w-full">
          {/* Centered Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center w-full flex flex-col items-center pt-8"
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sage/90 border border-gold/40 text-sm font-semibold text-foreground mb-6 shadow-md backdrop-blur-sm"
            >
              <Shield className="w-4 h-4 text-gold flex-shrink-0" />
              <span className="whitespace-nowrap">{t("hero.trustedBy")}</span>
            </motion.div>

            {/* Typewriter Heading */}
            <div className="mb-4 min-h-[120px] flex items-center justify-center">
              <h1 className="heading-display text-foreground text-center">
                <span className="inline-block">
                  {parts.regular}
                  {parts.regular.length > 0 && parts.gold.length === 0 && " "}
                  {parts.gold && <span className="text-gold">{parts.gold}</span>}
                  {currentIndex < fullText.length && (
                    <span className={`inline-block w-0.5 h-8 bg-gold ml-1 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
                  )}
                </span>
              </h1>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (fullText.length * 100) / 1000 + 0.5 }}
              className="body-large mb-6 max-w-2xl mx-auto text-center"
            >
              {t("hero.createManageShare")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (fullText.length * 100) / 1000 + 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
            >
              <Link to="/dashboard">
                <Button variant="hero" size="xl">
                  {t("hero.startYourWill")}
                </Button>
              </Link>
              <Button 
                variant="hero-outline" 
                size="xl" 
                className="gap-2"
                onClick={() => setShowVideoDialog(true)}
              >
                <Play className="w-5 h-5" />
                {t("hero.watchDemo")}
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (fullText.length * 100) / 1000 + 0.9 }}
              className="flex flex-wrap justify-center gap-4"
            >
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={badge.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (fullText.length * 100) / 1000 + 1.1 + index * 0.1 }}
                  className="trust-badge"
                >
                  <badge.icon className="w-4 h-4 text-gold" />
                  {badge.text}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Video Demo Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-4xl w-full p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{t("hero.watchDemo")}</DialogTitle>
            <DialogDescription>
              {t("hero.demoDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black rounded-b-lg overflow-hidden">
            <video
              className="w-full h-full"
              controls
              autoPlay
              onEnded={() => setShowVideoDialog(false)}
            >
              <source src="/Demo_Video_For_LegacyLink_Website.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
