import { Target, Eye, HeartHandshake } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-24 bg-gradient-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <span className="inline-block px-4 py-1 rounded-full bg-emerald-light text-primary text-sm font-medium mb-4">
            Who We Are
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">Global Wings Charity</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Founded in 2025, we are a passionate group of volunteers dedicated to 
            uplifting communities through education, emergency aid, and sustainable support programs.
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Mission */}
          <div className="group p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-xl bg-gradient-hero flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-gold">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-4">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide free, quality education to underprivileged students and extend 
              humanitarian aid to families facing hardship, creating lasting positive change in communities.
            </p>
          </div>

          {/* Vision */}
          <div className="group p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-gold">
              <Eye className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A world where every child has access to education and every family 
              has the support they need to thrive, regardless of their circumstances.
            </p>
          </div>

          {/* Values */}
          <div className="group p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2">
            <div className="w-16 h-16 rounded-xl bg-hero-gradient flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-gold">
              <HeartHandshake className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-heading text-2xl font-bold text-foreground mb-4">Our Values</h3>
            <p className="text-muted-foreground leading-relaxed">
              Compassion, integrity, and community drive everything we do. We believe 
              in transparency, accountability, and the power of collective action.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mt-20 max-w-4xl mx-auto text-center">
          <div className="p-10 rounded-3xl bg-gradient-card border border-accent shadow-soft">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-6">Our Story</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Global Wings Charity was born from a simple belief: that education is the 
              most powerful tool for change. Starting with just a handful of volunteers 
              in 2025, we began offering free classes to students who couldn't afford 
              tuition. Today, we've grown to serve hundreds of students while expanding 
              our mission to include disaster relief and community support programs. 
              Every step forward is powered by the generosity of our donors and the 
              dedication of our volunteers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
