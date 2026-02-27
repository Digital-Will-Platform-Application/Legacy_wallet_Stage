import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, FileText, Users, Clock, CheckCircle, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LearnMore = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: FileText,
      title: "Digital Will Creation",
      description: "Create your will using audio, video, chat, or text formats. Our platform guides you through the process step by step, ensuring nothing is missed.",
    },
    {
      icon: Users,
      title: "Recipient Management",
      description: "Easily add and manage beneficiaries. Set up verification for recipients and assign assets to specific people with clear allocation percentages.",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your sensitive information is protected with 256-bit encryption. We use industry-standard security practices to keep your data safe.",
    },
    {
      icon: Clock,
      title: "Update Anytime",
      description: "Life changes, and so can your will. Update your will, recipients, and asset allocations at any time with just a few clicks.",
    },
  ];

  const benefits = [
    "Peace of mind knowing your wishes are documented",
    "Easy to update as your life circumstances change",
    "Secure digital storage accessible to trusted recipients",
    "Multiple format options (audio, video, text, chat)",
    "Comprehensive asset management and allocation",
    "Recipient verification for added security",
    "Professional guidance through the process",
    "24/7 access to your will from anywhere",
  ];

  const faqs = [
    {
      question: "Is my digital will legally binding?",
      answer: "While Digital Will provides a secure platform to create and store your will, we recommend consulting with a legal professional in your jurisdiction to ensure your will meets all local legal requirements. Laws vary by location, and some jurisdictions may require specific formalities like witnesses or notarization.",
    },
    {
      question: "Can I change my plan later?",
      answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges. Your data is always preserved when switching plans.",
    },
    {
      question: "What happens if I cancel my subscription?",
      answer: "Your data remains secure and accessible. You can export your will and recipient information at any time. Basic plan features remain available even after cancellation, ensuring you never lose access to your important documents.",
    },
    {
      question: "How secure is my information?",
      answer: "We use 256-bit SSL encryption to protect all data in transit and at rest. Your passwords are hashed using industry-standard algorithms, and we implement multiple layers of security including rate limiting and leaked password protection. We never share your information with third parties.",
    },
    {
      question: "Can I add multiple wills?",
      answer: "Yes! With Professional and Legacy plans, you can create unlimited wills. This is useful if you want separate wills for different purposes or need to create wills for different time periods.",
    },
    {
      question: "How do recipients access the will?",
      answer: "Recipients receive email notifications with verification links. Once they verify their identity, they can access the information you've shared with them. You control what each recipient can see.",
    },
    {
      question: "What types of assets can I include?",
      answer: "You can include any type of asset: property, investments, bank accounts, vehicles, jewelry, digital assets, insurance policies, business interests, and more. Our platform supports comprehensive asset categorization and allocation.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us within 30 days for a full refund. No questions asked.",
    },
    {
      question: "Can I record video messages for my loved ones?",
      answer: "Yes! Our video will feature allows you to record personal messages for your beneficiaries. These videos are stored securely and can be shared with recipients when appropriate.",
    },
    {
      question: "What if I need legal advice?",
      answer: "While Digital Will provides tools to create and manage your will, we always recommend consulting with a qualified estate planning attorney in your jurisdiction for complex situations or to ensure full legal compliance.",
    },
    {
      question: "How long does it take to create a will?",
      answer: "Most users complete their will in under 10 minutes. The process is designed to be simple and straightforward, with guided steps for creating your will, adding recipients, and allocating assets.",
    },
    {
      question: "Is my data backed up?",
      answer: "Yes, all data is automatically backed up with redundancy across multiple secure servers. Your information is protected against data loss and is accessible 24/7.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Back Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-gold font-medium text-sm uppercase tracking-wider mb-4 block">
              Learn More
            </span>
            <h1 className="heading-section text-foreground mb-6">
              Everything You Need to Know About Digital Will
            </h1>
            <p className="body-large text-muted-foreground">
              Discover how Digital Will helps you secure your legacy and protect what matters most to you and your loved ones.
            </p>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="font-serif text-3xl font-semibold text-foreground mb-8 text-center">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="card-elevated p-6"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <div className="card-elevated p-8 bg-gradient-to-br from-secondary/50 to-background">
              <h2 className="font-serif text-3xl font-semibold text-foreground mb-6 text-center">
                Why Choose Digital Will?
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <div className="card-elevated p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                    Your Security is Our Priority
                  </h2>
                  <p className="text-muted-foreground">
                    We take security seriously to protect your sensitive information
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">256-bit Encryption</h3>
                  <p className="text-sm text-muted-foreground">
                    All data is encrypted using industry-standard AES-256 encryption, the same level used by banks and financial institutions.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Secure Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Multi-factor authentication options and leaked password protection ensure your account stays secure.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Privacy First</h3>
                  <p className="text-sm text-muted-foreground">
                    We never share your information with third parties. Your data belongs to you, and you control who can access it.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <HelpCircle className="w-6 h-6 text-gold" />
                <h2 className="font-serif text-3xl font-semibold text-foreground">
                  Frequently Asked Questions
                </h2>
              </div>
              <p className="text-muted-foreground">
                Find answers to common questions about Digital Will
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="card-elevated px-6 py-2 rounded-lg border-none"
                >
                  <AccordionTrigger className="font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-2">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="card-elevated p-8 max-w-2xl mx-auto">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-6">
                Create your digital will in minutes and secure your legacy for your loved ones. Start with our free plan today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/pricing">
                  <Button variant="gold" size="lg" className="gap-2">
                    View Pricing
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LearnMore;
