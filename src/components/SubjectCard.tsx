import React from "react";
import { motion } from "framer-motion";
import { BookOpen, FileText, Trash2 } from "lucide-react";
import { Subject } from "@/store/app-store";
import { FlatButton } from "./FlatButton";

interface SubjectCardProps {
  subject: Subject;
  index: number;
  isActive?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

const SUBJECT_BG_CLASSES = [
  "bg-primary/10 border-primary/30",
  "bg-secondary/10 border-secondary/30",
  "bg-accent/10 border-accent/30",
];

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  index,
  isActive,
  onSelect,
  onDelete,
  compact,
}) => {
  const bgClass = SUBJECT_BG_CLASSES[index % 3];

  if (compact) {
    return (
      <button
        onClick={onSelect}
        className={`
          w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-display
          ${isActive
            ? `${bgClass} border-foreground shadow-sm`
            : `bg-card border-border hover:border-foreground/30`
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: subject.color }}
          />
          <span className="font-bold text-lg">{subject.name}</span>
          <span className="ml-auto text-sm text-muted-foreground">
            {subject.notes.length} file{subject.notes.length !== 1 ? "s" : ""}
          </span>
        </div>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flat-card ${bgClass} relative overflow-hidden`}
    >
      <div className="pattern-dots absolute inset-0 pointer-events-none" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="font-display text-heading font-bold mb-2">
          {subject.name}
        </h3>

        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">
            {subject.notes.length} file{subject.notes.length !== 1 ? "s" : ""} uploaded
          </span>
        </div>

        {subject.notes.length > 0 && (
          <div className="space-y-1 mb-4">
            {subject.notes.slice(0, 3).map((note, i) => (
              <p key={i} className="text-xs text-muted-foreground truncate">
                📄 {note.fileName}
              </p>
            ))}
            {subject.notes.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{subject.notes.length - 3} more
              </p>
            )}
          </div>
        )}

        {onSelect && (
          <FlatButton onClick={onSelect} variant="navy" size="sm" className="w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            Study This
          </FlatButton>
        )}
      </div>
    </motion.div>
  );
};

export default SubjectCard;
