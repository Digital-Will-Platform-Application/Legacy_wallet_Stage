import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, Heart, Users, Target, Award, Mail, MapPin, Phone, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Security First",
      description: "We prioritize the security and privacy of your sensitive information above all else.",
    },
    {
      icon: Heart,
      title: "Compassionate Service",
      description: "We understand the emotional importance of will planning and treat every user with care.",
    },
    {
      icon: Users,
      title: "User-Centric",
      description: "Every feature is designed with our users' needs and peace of mind in mind.",
    },
    {
      icon: Target,
      title: "Innovation",
      description: "We continuously improve our platform to provide the best digital will management experience.",
    },
  ];

  const stats = [
    { label: "Trusted Users", value: "50,000+", icon: Users },
    { label: "Wills Created", value: "100,000+", icon: Shield },
    { label: "Countries Served", value: "50+", icon: MapPin },
    { label: "Years of Service", value: "5+", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-sage/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-sm font-medium text-foreground mb-6">
                <Building2 className="w-4 h-4 text-gold" />
                About Digital Will
              </div>
              
              <h1 className="heading-display text-foreground mb-6">
                Securing Wills, One Will at a Time
              </h1>
              
              <p className="body-large text-muted-foreground mb-8">
                Digital Will was founded with a simple mission: to make estate planning accessible, 
                secure, and meaningful for everyone. We believe that everyone deserves peace of mind 
                when it comes to protecting their will and ensuring their wishes are honored.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 md:py-10 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 text-gold mx-auto mb-3" />
                  <div className="font-serif text-3xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="heading-section text-foreground mb-4 text-center">
                  Our Story
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Digital Will was born from a personal experience. Our founders recognized that 
                    traditional estate planning was often complicated, expensive, and emotionally 
                    challenging. They saw families struggling to document their wishes and ensure 
                    their loved ones would be taken care of.
                  </p>
                  <p>
                    In response, we set out to create a platform that would democratize estate 
                    planning—making it accessible to everyone, regardless of their financial 
                    situation or technical expertise. We combined cutting-edge security technology 
                    with an intuitive, user-friendly interface to create something truly special.
                  </p>
                  <p>
                    Today, Digital Will serves thousands of families worldwide, helping them secure 
                    their wills with confidence. We're proud of what we've built, but we're even 
                    more excited about what's to come as we continue to innovate and improve.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <h2 className="heading-section text-foreground mb-4">
                  Our Mission
                </h2>
                <p className="body-large text-muted-foreground max-w-2xl mx-auto">
                  To empower individuals and families to protect their wills with confidence, 
                  ensuring that their wishes are documented, secure, and accessible to those who 
                  matter most.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mt-8"
              >
                <h3 className="font-serif text-2xl font-semibold text-foreground mb-4">
                  Our Vision
                </h3>
                <p className="body-large text-muted-foreground max-w-2xl mx-auto">
                  A world where every person has the tools and confidence to plan their will, 
                  leaving behind not just assets, but peace of mind for their loved ones.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="heading-section text-foreground mb-4">
                Our Values
              </h2>
              <p className="body-large text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do at Digital Will
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="card-elevated h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-4">
                        <value.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-foreground mb-3">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section - Placeholder */}
        <section className="py-12 md:py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="heading-section text-foreground mb-4">
                Our Team
              </h2>
              <p className="body-large text-muted-foreground mb-4">
                We're a diverse team of passionate individuals dedicated to making estate planning 
                accessible and secure. Our team combines expertise in technology, security, 
                legal compliance, and user experience.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Team member profiles will be updated here soon.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="heading-section text-foreground mb-4">
                  Get in Touch
                </h2>
                <p className="body-large text-muted-foreground">
                  Have questions? We'd love to hear from you.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="card-elevated">
                  <CardContent className="p-6 text-center">
                    <Mail className="w-8 h-8 text-gold mx-auto mb-4" />
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      Email
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      support@digitalwill.com
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Contact details will be updated
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardContent className="p-6 text-center">
                    <Phone className="w-8 h-8 text-gold mx-auto mb-4" />
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      Phone
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      +1 (555) 123-4567
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Contact details will be updated
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-8 h-8 text-gold mx-auto mb-4" />
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      Address
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      123 Will Street<br />
                      San Francisco, CA 94105
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      Contact details will be updated
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
