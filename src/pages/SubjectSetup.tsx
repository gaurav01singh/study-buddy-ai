import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ArrowRight, ArrowLeft } from "lucide-react";
import { FlatButton } from "@/components/FlatButton";
import FileUploadZone from "@/components/FileUploadZone";
import SubjectCard from "@/components/SubjectCard";
import { useAppStore, Subject } from "@/store/app-store";
import { parseFile, ParsedNote } from "@/lib/pdf-parser";
import { saveSubjectToFirestore, loadSubjectsFromFirestore, deleteSubjectFromFirestore } from "@/lib/firestore-service";
import { toast } from "sonner";

const SUBJECT_COLORS = [
  "hsl(14, 90%, 55%)",
  "hsl(175, 60%, 40%)",
  "hsl(50, 95%, 55%)",
];

const SubjectSetup: React.FC = () => {
  const navigate = useNavigate();
  const { subjects, addSubject, updateSubject, setSubjects } = useAppStore();
  const [newSubjectName, setNewSubjectName] = useState("");
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);

  // Load subjects from Firestore on mount
  useEffect(() => {
    if (subjects.length === 0) {
      loadSubjectsFromFirestore()
        .then((loaded) => {
          if (loaded.length > 0) {
            setSubjects(loaded);
          }
        })
        .catch((err) => console.warn("Firestore load failed (config may be missing):", err));
    }
  }, []);

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      toast.error("Enter a subject name");
      return;
    }
    if (subjects.length >= 3) {
      toast.error("Maximum 3 subjects allowed");
      return;
    }
    if (subjects.find((s) => s.name.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      toast.error("Subject already exists");
      return;
    }

    const id = crypto.randomUUID();
    const newSubject: Subject = {
      id,
      name: newSubjectName.trim(),
      color: SUBJECT_COLORS[subjects.length],
      notes: [],
      files: [],
    };
    addSubject(newSubject);
    setNewSubjectName("");
    setUploadingFor(id);
    
    // Save to Firestore
    saveSubjectToFirestore(newSubject).catch((err) =>
      console.warn("Firestore save failed:", err)
    );
  };

  const handleUploadFiles = async () => {
    if (!uploadingFor || tempFiles.length === 0) return;
    setParsing(true);
    try {
      const parsed: ParsedNote[] = [];
      for (const file of tempFiles) {
        const note = await parseFile(file);
        parsed.push(note);
      }

      const subject = subjects.find((s) => s.id === uploadingFor);
      if (subject) {
        updateSubject(uploadingFor, {
          notes: [...subject.notes, ...parsed],
          files: [...subject.files, ...tempFiles],
        });
      }
      setTempFiles([]);
      setUploadingFor(null);
      toast.success("Notes uploaded successfully!");
      
      // Persist updated subject to Firestore
      const updatedSubject = subjects.find((s) => s.id === uploadingFor);
      if (updatedSubject) {
        saveSubjectToFirestore({
          ...updatedSubject,
          notes: [...updatedSubject.notes, ...parsed],
          files: [...updatedSubject.files, ...tempFiles],
        }).catch((err) => console.warn("Firestore save failed:", err));
      }
    } catch (err) {
      toast.error("Failed to parse files. Please try again.");
      console.error(err);
    } finally {
      setParsing(false);
    }
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    if (uploadingFor === id) {
      setUploadingFor(null);
      setTempFiles([]);
    }
    // Delete from Firestore
    deleteSubjectFromFirestore(id).catch((err) =>
      console.warn("Firestore delete failed:", err)
    );
  };

  const allReady = subjects.length === 3 && subjects.every((s) => s.notes.length > 0);
  const canProceed = subjects.length > 0 && subjects.some((s) => s.notes.length > 0);

  return (
    <div className="min-h-screen bg-background pattern-diagonal">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <FlatButton onClick={() => navigate("/")} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </FlatButton>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-display font-display font-bold mb-2">
            Setup Your <span className="text-primary">Subjects</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Create exactly 3 subjects and upload notes for each ({subjects.length}/3 created)
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Add Subject + Upload */}
          <div className="space-y-6">
            {subjects.length < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flat-card"
              >
                <h2 className="font-display text-subheading font-bold mb-4">
                  Add Subject
                </h2>
                <div className="flex gap-3">
                  <input
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                    placeholder="e.g. Data Structures"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-border bg-background font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  <FlatButton onClick={handleAddSubject} variant="primary" size="md">
                    <Plus className="w-5 h-5" />
                  </FlatButton>
                </div>
              </motion.div>
            )}

            {uploadingFor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flat-card"
              >
                <h2 className="font-display text-subheading font-bold mb-2">
                  Upload Notes for{" "}
                  <span className="text-primary">
                    {subjects.find((s) => s.id === uploadingFor)?.name}
                  </span>
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Add PDF or TXT files for this subject
                </p>

                <FileUploadZone
                  files={tempFiles}
                  onFilesAdded={(files) => setTempFiles((prev) => [...prev, ...files])}
                  onFileRemoved={(index) =>
                    setTempFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                />

                <div className="flex gap-3 mt-4">
                  <FlatButton
                    onClick={handleUploadFiles}
                    variant="primary"
                    size="md"
                    disabled={tempFiles.length === 0 || parsing}
                  >
                    {parsing ? "Parsing..." : "Upload & Parse"}
                  </FlatButton>
                  <FlatButton
                    onClick={() => {
                      setUploadingFor(null);
                      setTempFiles([]);
                    }}
                    variant="ghost"
                    size="md"
                  >
                    Cancel
                  </FlatButton>
                </div>
              </motion.div>
            )}

            {!uploadingFor && subjects.length > 0 && subjects.some((s) => s.notes.length === 0) && (
              <div className="flat-card bg-accent/10 border-accent/30">
                <p className="font-display font-bold text-lg mb-2">📝 Upload Notes</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Select a subject card on the right to upload notes
                </p>
              </div>
            )}

            {canProceed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flat-card ${allReady ? 'bg-success/10 border-success/30' : 'bg-primary/10 border-primary/30'}`}
              >
                <h2 className="font-display text-subheading font-bold mb-2">
                  {allReady ? "✅ All Set!" : "🚀 Ready to Go!"}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {allReady
                    ? "All 3 subjects have notes uploaded. Ready to study!"
                    : `${subjects.filter(s => s.notes.length > 0).length} subject(s) ready. You can add more later.`
                  }
                </p>
                <FlatButton
                  onClick={() => navigate("/chat")}
                  variant="primary"
                  size="lg"
                >
                  Start Studying
                  <ArrowRight className="w-5 h-5 ml-2" />
                </FlatButton>
              </motion.div>
            )}
          </div>

          {/* Right: Subject Cards */}
          <div className="space-y-4">
            {subjects.map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={i}
                onSelect={() => {
                  if (subject.notes.length === 0) {
                    setUploadingFor(subject.id);
                    setTempFiles([]);
                  } else {
                    setUploadingFor(subject.id);
                    setTempFiles([]);
                  }
                }}
                onDelete={() => handleDeleteSubject(subject.id)}
              />
            ))}

            {subjects.length === 0 && (
              <div className="flat-card text-center py-16">
                <p className="font-display text-heading font-bold text-muted-foreground/30 mb-2">
                  No subjects yet
                </p>
                <p className="text-muted-foreground">
                  Create your first subject to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectSetup;
