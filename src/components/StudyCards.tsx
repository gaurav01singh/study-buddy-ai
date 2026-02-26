import React, { useState } from "react";
import { motion } from "framer-motion";
import { MCQuestion, ShortAnswerQuestion } from "@/lib/ai-service";
import { Check, X, BookOpen, Quote } from "lucide-react";
import { FlatButton } from "./FlatButton";

interface MCQCardProps {
  question: MCQuestion;
  index: number;
}

export const MCQCard: React.FC<MCQCardProps> = ({ question, index }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = (optionIndex: number) => {
    if (revealed) return;
    setSelected(optionIndex);
    setRevealed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flat-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm">
          {index + 1}
        </span>
        <span className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">
          Multiple Choice
        </span>
      </div>

      <p className="font-display text-lg font-bold mb-4">{question.question}</p>

      <div className="space-y-2 mb-4">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;
          let optionClass = "border-border bg-card hover:border-foreground/30";

          if (revealed) {
            if (isCorrect) optionClass = "border-success bg-success/10";
            else if (isSelected && !isCorrect) optionClass = "border-destructive bg-destructive/10";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`
                w-full text-left p-3 rounded-xl border-2 transition-all duration-200
                flex items-center gap-3 font-body text-sm
                ${optionClass}
              `}
            >
              <span className="w-6 h-6 rounded-md border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{option}</span>
              {revealed && isCorrect && <Check className="w-5 h-5 text-success" />}
              {revealed && isSelected && !isCorrect && <X className="w-5 h-5 text-destructive" />}
            </button>
          );
        })}
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-3 rounded-xl bg-muted border-2 border-border space-y-2"
        >
          <p className="text-sm font-body">
            <span className="font-bold">Explanation:</span> {question.explanation}
          </p>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              {question.citation.fileName} — {question.citation.section}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

interface ShortAnswerCardProps {
  question: ShortAnswerQuestion;
  index: number;
}

export const ShortAnswerCard: React.FC<ShortAnswerCardProps> = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flat-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-8 h-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-display font-bold text-sm">
          {index + 1}
        </span>
        <span className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground">
          Short Answer
        </span>
      </div>

      <p className="font-display text-lg font-bold mb-4">{question.question}</p>

      {!showAnswer ? (
        <FlatButton onClick={() => setShowAnswer(true)} variant="outline" size="sm">
          <BookOpen className="w-4 h-4 mr-2" />
          Reveal Answer
        </FlatButton>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 rounded-xl bg-muted border-2 border-border space-y-2"
        >
          <p className="text-sm font-body">{question.modelAnswer}</p>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              {question.citation.fileName} — {question.citation.section}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
