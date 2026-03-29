import { useState } from "react";
import { Mail, Phone, MapPin, Send, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 bg-gradient-section">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-emerald-light text-primary text-sm font-medium mb-4">
            Get In Touch
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Contact <span className="text-primary">Us</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Have questions or want to get involved? We'd love to hear from you. 
            Reach out and let's make a difference together.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-gradient-card border border-accent shadow-card">
              <h3 className="font-heading text-2xl font-bold text-foreground mb-6">
                Let's Connect
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center flex-shrink-0 shadow-gold">
                    <Mail className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Email Us</h4>
                    <p className="text-muted-foreground">contact@globalwingscharity.org</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0 shadow-gold">
                    <Phone className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Call Us</h4>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-hero-gradient flex items-center justify-center flex-shrink-0 shadow-gold">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Visit Us</h4>
                    <p className="text-muted-foreground">123 Charity Lane, Hope City, HC 12345</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Volunteer CTA */}
            <div className="p-8 rounded-2xl bg-gradient-hero text-primary-foreground shadow-elevated">
              <HeartHandshake className="w-10 h-10 mb-4 text-secondary" />
              <h3 className="font-heading text-2xl font-bold mb-3">Become a Volunteer</h3>
              <p className="text-primary-foreground/80 mb-6">
                Join our team of dedicated volunteers and help us make a real difference 
                in the lives of students and families in need.
              </p>
              <Button variant="charityOutline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Join Our Team
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-8 rounded-2xl bg-card shadow-elevated border border-border">
            <h3 className="font-heading text-2xl font-bold text-foreground mb-6">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Your Name
                  </label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-muted/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Subject
                </label>
                <Input
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <Textarea
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="bg-muted/50 resize-none"
                />
              </div>
              <Button type="submit" variant="charity" size="lg" className="w-full">
                Send Message
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
