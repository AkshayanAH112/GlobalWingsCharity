import { TrendingUp, Users, BookOpen, MapPin } from "lucide-react";

const stats = [
  {
    value: "500+",
    label: "Students Educated",
    description: "Children receiving free quality education",
    icon: BookOpen,
  },
  {
    value: "1,000+",
    label: "Families Supported",
    description: "Families helped through our programs",
    icon: Users,
  },
  {
    value: "200+",
    label: "Homes Rebuilt",
    description: "Disaster-affected homes restored",
    icon: MapPin,
  },
  {
    value: "50+",
    label: "Active Volunteers",
    description: "Dedicated hearts making a difference",
    icon: TrendingUp,
  },
];

export function ImpactSection() {
  return (
    <section id="impact" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-95" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary-foreground/20 text-gold-light text-sm font-medium mb-4">
            Our Impact
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Making a <span className="text-secondary">Difference</span>
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Since our founding in 2025, we've touched thousands of lives. Here's a 
            glimpse of the impact we've made together.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group p-8 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-secondary" />
                <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <h3 className="text-lg font-semibold text-primary-foreground mb-1">
                {stat.label}
              </h3>
              <p className="text-sm text-primary-foreground/70">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="font-heading text-2xl font-bold text-primary-foreground text-center mb-12">
            Our Journey
          </h3>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-foreground/30 -translate-x-1/2" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {[
                { year: "2025", title: "Foundation", desc: "Started with 10 volunteers and 50 students" },
                { year: "2025", title: "First Disaster Response", desc: "Helped 100 families after local flooding" },
                { year: "2026", title: "Growing Strong", desc: "Expanded to 500+ students and multiple programs" },
              ].map((item, index) => (
                <div
                  key={item.title}
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <span className="text-secondary font-bold">{item.year}</span>
                    <h4 className="text-xl font-semibold text-primary-foreground">{item.title}</h4>
                    <p className="text-primary-foreground/70">{item.desc}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-secondary shadow-gold z-10" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
