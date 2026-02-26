import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FlatButton } from "@/components/FlatButton";
import { BookOpen, MessageSquare, Brain, ArrowRight } from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pattern-grid">
      {/* Hero */}
      <div className="container mx-auto px-6 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="flat-tag bg-primary/10 text-primary border-primary/30">
              <Brain className="w-4 h-4 mr-1" />
              Study Copilot
            </span>
          </div>

          <h1 className="text-hero font-display font-bold text-foreground mb-6">
            Ask<span className="text-primary">My</span>Notes
          </h1>

          <p className="text-subheading text-muted-foreground max-w-2xl mb-10 font-body">
            Upload your notes. Pick a subject. Get answers grounded in YOUR study material — with citations, confidence levels, and zero guesswork.
          </p>

          <div className="flex flex-wrap gap-4">
            <FlatButton
              onClick={() => navigate("/setup")}
              variant="primary"
              size="xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </FlatButton>
            <FlatButton
              onClick={() => navigate("/setup")}
              variant="outline"
              size="xl"
            >
              Learn More
            </FlatButton>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[
            {
              icon: BookOpen,
              title: "3 Subjects",
              desc: "Set up exactly three subjects with your uploaded PDF & TXT notes.",
              color: "primary",
            },
            {
              icon: MessageSquare,
              title: "Scoped Q&A",
              desc: "Ask questions and get answers strictly from your selected subject's notes.",
              color: "secondary",
            },
            {
              icon: Brain,
              title: "Study Mode",
              desc: "Auto-generated MCQs and short-answer questions with citations.",
              color: "accent",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flat-card pattern-dots relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 border-2 border-${feature.color}/30 flex items-center justify-center mb-5`}
                >
                  <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="font-display text-heading font-bold mb-2">
                  {feature.title}
                </h3>
                <p className="font-body text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-24 text-center"
        >
          <h2 className="text-display font-display font-bold mb-12">
            How It <span className="text-primary">Works</span>
          </h2>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", label: "Create Subjects" },
              { step: "02", label: "Upload Notes" },
              { step: "03", label: "Ask Questions" },
              { step: "04", label: "Study Smart" },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="font-display text-hero font-bold text-primary/20 mb-2">
                  {item.step}
                </div>
                <p className="font-display text-lg font-bold">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="font-display font-bold text-lg">
            Ask<span className="text-primary">My</span>Notes
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Your subject-scoped study copilot
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
