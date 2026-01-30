"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Code2, Sparkles, Zap, Github } from "lucide-react";

export const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/40 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Code2 className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Polaris</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/auth/signin")}>Sign In</Button>
          <Button onClick={() => router.push("/auth/signin")} className="gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-24 md:py-32 flex flex-col items-center text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-sm mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Next-generation Cloud IDE</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Build at the speed of <br />
              <span className="text-primary">thought.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Polaris is an AI-native IDE in your browser. Real-time collaboration,
              intelligent suggestions, and instant deployment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 text-lg gap-2" onClick={() => router.push("/auth/signin")}>
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                View Demo
              </Button>
            </div>
          </motion.div>

          {/* Abstract background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-primary" />}
              title="Instant Setup"
              description="No more 'it works on my machine'. Spin up a full environment in seconds."
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6 text-primary" />}
              title="AI-Powered"
              description="Intelligent code completion and refactoring that understands your context."
            />
            <FeatureCard
              icon={<Code2 className="w-6 h-6 text-primary" />}
              title="Native Git"
              description="Seamless integration with GitHub. Commit, push, and PR without leaving the editor."
            />
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t border-border/40 text-center text-muted-foreground text-sm">
        <p>© 2024 Polaris IDE. Built for the modern developer.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="p-8 rounded-2xl border border-border bg-background flex flex-col items-start text-left gap-4"
  >
    <div className="p-3 rounded-xl bg-primary/10">
      {icon}
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </motion.div>
);
