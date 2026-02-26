import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Brain, Loader2, RefreshCw } from "lucide-react";
import { FlatButton } from "@/components/FlatButton";
import SubjectCard from "@/components/SubjectCard";
import { MCQCard, ShortAnswerCard } from "@/components/StudyCards";
import { useAppStore } from "@/store/app-store";
import { generateStudyQuestions, StudyModeResponse } from "@/lib/ai-service";
import { buildNotesContext } from "@/lib/pdf-parser";
import { toast } from "sonner";

const StudyMode: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, activeSubjectId, setActiveSubject } = useAppStore();
  const [studyData, setStudyData] = useState<StudyModeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  const handleGenerate = async () => {
    if (!activeSubject) return;
    setLoading(true);
    setStudyData(null);

    try {
      const context = buildNotesContext(activeSubject.notes);
      const result = await generateStudyQuestions(activeSubject.name, context);
      setStudyData(result);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pattern-diagonal">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <FlatButton onClick={() => navigate("/chat")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Chat
          </FlatButton>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-display font-display font-bold mb-2">
            Study <span className="text-primary">Mode</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Select a subject to generate practice questions from your notes
          </p>
        </motion.div>

        {/* Subject Selector */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {subjects.map((subject, i) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              index={i}
              isActive={subject.id === activeSubjectId}
              onSelect={() => {
                setActiveSubject(subject.id);
                setStudyData(null);
              }}
              compact
            />
          ))}
        </div>

        {activeSubject && (
          <div className="mb-8 flex gap-3">
            <FlatButton
              onClick={handleGenerate}
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-2" />
                  Generate Questions
                </>
              )}
            </FlatButton>
            {studyData && (
              <FlatButton
                onClick={handleGenerate}
                variant="outline"
                size="lg"
                disabled={loading}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Regenerate
              </FlatButton>
            )}
          </div>
        )}

        {!activeSubject && (
          <div className="flat-card text-center py-16">
            <p className="font-display text-heading font-bold text-muted-foreground/30 mb-2">
              📚
            </p>
            <p className="font-display text-xl font-bold text-muted-foreground">
              Select a subject above to begin
            </p>
          </div>
        )}

        {studyData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* MCQs */}
            <div>
              <h2 className="font-display text-heading font-bold mb-6">
                Multiple Choice Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {studyData.mcqs.map((mcq, i) => (
                  <MCQCard key={i} question={mcq} index={i} />
                ))}
              </div>
              {studyData.mcqs.length === 0 && (
                <p className="text-muted-foreground">No MCQs generated. Try again.</p>
              )}
            </div>

            {/* Short Answers */}
            <div>
              <h2 className="font-display text-heading font-bold mb-6">
                Short Answer Questions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {studyData.shortAnswers.map((sa, i) => (
                  <ShortAnswerCard key={i} question={sa} index={i} />
                ))}
              </div>
              {studyData.shortAnswers.length === 0 && (
                <p className="text-muted-foreground">No short answers generated. Try again.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudyMode;
