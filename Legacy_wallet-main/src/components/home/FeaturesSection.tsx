import { Mic, Video, MessageSquare, FolderOpen, Users, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const FeaturesSection = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Mic,
      title: t("features.audioRecording"),
      description: t("features.audioDescription"),
      color: "from-gold to-gold-light",
    },
    {
      icon: Video,
      title: t("features.videoMessages"),
      description: t("features.videoDescription"),
      color: "from-navy to-navy-light",
    },
    {
      icon: MessageSquare,
      title: t("features.chatInterface"),
      description: t("features.chatDescription"),
      color: "from-sage-dark to-sage",
    },
    {
      icon: FolderOpen,
      title: t("features.assetManagement"),
      description: t("features.assetDescription"),
      color: "from-gold to-gold-light",
    },
    {
      icon: Users,
      title: t("features.recipientPortal"),
      description: t("features.recipientDescription"),
      color: "from-navy to-navy-light",
    },
    {
      icon: Bell,
      title: t("features.smartNotifications"),
      description: t("features.notificationsDescription"),
      color: "from-sage-dark to-sage",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-gold font-medium text-sm uppercase tracking-wider mb-4 block">
            {t("features.title")}
          </span>
          <h2 className="heading-section text-foreground mb-4">
            {t("features.subtitle")}
          </h2>
          <p className="body-large">
            {t("features.description")}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-interactive group"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
