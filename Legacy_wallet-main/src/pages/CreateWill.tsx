import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Video,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Check,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";

type Method = "audio" | "video" | "chat" | null;

const CreateWill = () => {
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);
  const navigate = useNavigate();

  const methods = [
    {
      id: "audio" as Method,
      icon: Mic,
      title: "Audio Recording",
      description: "Speak your wishes naturally. We'll transcribe and organize everything for you.",
      features: ["Natural conversation", "AI transcription", "Edit anytime"],
      time: "5-10 min",
      color: "from-gold to-gold-light",
    },
    {
      id: "video" as Method,
      icon: Video,
      title: "Video Message",
      description: "Record personal video messages for your loved ones to treasure.",
      features: ["Personal touch", "Visual memories", "Secure storage"],
      time: "5-15 min",
      color: "from-navy to-navy-light",
    },
    {
      id: "chat" as Method,
      icon: MessageSquare,
      title: "Guided Chat",
      description: "Answer simple questions and we'll create your will step by step.",
      features: ["Easy questions", "Save progress", "Review & edit"],
      time: "10-15 min",
      color: "from-sage-dark to-sage",
    },
  ];

  const handleContinue = () => {
    if (selectedMethod) {
      navigate(`/create/${selectedMethod}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 pb-12">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage/50 text-sm font-medium text-foreground mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              Step 1 of 4
            </div>
            <h1 className="heading-section text-foreground mb-4">
              How Would You Like to Create Your Will?
            </h1>
            <p className="body-large max-w-xl mx-auto">
              Choose the method that feels most natural to you. You can always switch or use multiple methods.
            </p>
          </motion.div>

          {/* Method Selection */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {methods.map((method, index) => (
              <motion.button
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMethod(method.id)}
                className={`relative text-left p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedMethod === method.id
                    ? "border-gold bg-gold/5 shadow-gold"
                    : "border-border bg-card hover:border-gold/50"
                }`}
              >
                {/* Selected Indicator */}
                <AnimatePresence>
                  {selectedMethod === method.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gold flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4`}>
                  <method.icon className="w-7 h-7 text-primary-foreground" />
                </div>

                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  {method.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {method.description}
                </p>

                {/* Features */}
                <ul className="space-y-1 mb-4">
                  {method.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3 h-3 text-gold" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Time Estimate */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  ~{method.time}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              variant="hero"
              size="xl"
              onClick={handleContinue}
              disabled={!selectedMethod}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Your data is encrypted and secure
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CreateWill;
