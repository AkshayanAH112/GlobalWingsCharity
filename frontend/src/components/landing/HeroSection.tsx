import { ArrowRight, HeartHandshake, Users, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-charity.jpg";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Global Wings Charity volunteers helping students"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy/85 to-royal/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/50 via-transparent to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-gold/30 rounded-full blur-2xl animate-float" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-32 text-center">
        <div className="max-w-4xl mx-auto animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 text-gold-light mb-8">
            <HeartHandshake className="w-4 h-4" />
            <span className="text-sm font-medium">Empowering Lives Since 2025</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Spreading Wings of{" "}
            <span className="text-secondary">Hope</span>{" "}
            <br className="hidden md:block" />
            Across the World
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            We provide free education, disaster relief, and community support to 
            those in need. Together, we can build a brighter future for every child.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button variant="charity" size="xl" className="group">
              Start Donating
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="charityOutline" size="xl">
              Learn More
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <GraduationCap className="w-8 h-8 text-secondary mb-3" />
              <span className="text-3xl font-bold text-primary-foreground">500+</span>
              <span className="text-primary-foreground/70">Students Educated</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Users className="w-8 h-8 text-secondary mb-3" />
              <span className="text-3xl font-bold text-primary-foreground">1,000+</span>
              <span className="text-primary-foreground/70">Families Helped</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <HeartHandshake className="w-8 h-8 text-secondary mb-3" />
              <span className="text-3xl font-bold text-primary-foreground">50+</span>
              <span className="text-primary-foreground/70">Volunteers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary-foreground/70 rounded-full" />
        </div>
      </div>
    </section>
  );
}
