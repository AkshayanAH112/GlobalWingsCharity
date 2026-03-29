import { GraduationCap, Home, HeartHandshake, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import educationImage from "@/assets/education-program.jpg";
import disasterImage from "@/assets/disaster-relief.jpg";
import communityImage from "@/assets/community-support.jpg";

const programs = [
  {
    title: "Free Education Program",
    description:
      "We provide completely free classes to underprivileged students, covering subjects from mathematics to languages. Our dedicated volunteer teachers ensure quality education accessible to all.",
    icon: GraduationCap,
    image: educationImage,
    stats: "500+ students enrolled",
    color: "primary",
  },
  {
    title: "Disaster Relief",
    description:
      "When disaster strikes, we're there to help. From providing emergency supplies to rebuilding homes, we support affected families through their most challenging times.",
    icon: Home,
    image: disasterImage,
    stats: "200+ homes rebuilt",
    color: "secondary",
  },
  {
    title: "Community Support",
    description:
      "Our home scheme provides ongoing support to poor families through food distribution, healthcare assistance, and livelihood programs to help them become self-sufficient.",
    icon: HeartHandshake,
    image: communityImage,
    stats: "1,000+ families helped",
    color: "primary",
  },
];

export function ProgramsSection() {
  return (
    <section id="programs" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-gold-light text-gold-dark text-sm font-medium mb-4">
            What We Do
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Programs</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From education to emergency aid, our programs are designed to create 
            meaningful, lasting impact in the lives of those we serve.
          </p>
        </div>

        {/* Programs Grid */}
        <div className="space-y-16">
          {programs.map((program, index) => (
            <div
              key={program.title}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-8 lg:gap-16 items-center`}
            >
              {/* Image */}
              <div className="flex-1 w-full">
                <div className="relative group overflow-hidden rounded-3xl shadow-elevated">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 rounded-full bg-card/90 backdrop-blur-sm">
                    <Utensils className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{program.stats}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 w-full">
                <div className="max-w-lg">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-gold ${
                      program.color === "primary" ? "bg-gradient-hero" : "bg-gradient-gold"
                    }`}
                  >
                    <program.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {program.title}
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    {program.description}
                  </p>
                  <Button variant="charitySecondary">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
