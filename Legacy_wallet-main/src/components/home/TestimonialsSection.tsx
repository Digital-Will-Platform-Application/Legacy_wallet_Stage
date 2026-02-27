import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const testimonials = [
    {
      name: t("testimonials.testimonial1Name"),
      role: t("testimonials.testimonial1Role"),
      content: t("testimonials.testimonial1Content"),
      rating: 5,
    },
    {
      name: t("testimonials.testimonial2Name"),
      role: t("testimonials.testimonial2Role"),
      content: t("testimonials.testimonial2Content"),
      rating: 5,
    },
    {
      name: t("testimonials.testimonial3Name"),
      role: t("testimonials.testimonial3Role"),
      content: t("testimonials.testimonial3Content"),
      rating: 5,
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-gold font-medium text-sm uppercase tracking-wider mb-4 block">
            {t("testimonials.title")}
          </span>
          <h2 className="heading-section mb-4">
            {t("testimonials.subtitle")}
          </h2>
          <p className="text-primary-foreground/70 text-lg">
            {t("testimonials.description")}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6 backdrop-blur-sm"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-gold/30" />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              <p className="text-primary-foreground/80 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-primary font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-sm text-primary-foreground/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
