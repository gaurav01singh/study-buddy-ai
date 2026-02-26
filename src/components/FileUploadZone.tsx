import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadZoneProps {
  files: File[];
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  subjectColor?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  files,
  onFilesAdded,
  onFileRemoved,
  subjectColor,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
    },
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
          }
        `}
        style={isDragActive && subjectColor ? { borderColor: subjectColor } : {}}
      >
        <input {...getInputProps()} />
        <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <p className="font-display text-lg font-bold text-foreground">
          {isDragActive ? "Drop files here" : "Drop PDF or TXT files"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          or click to browse
        </p>
      </div>

      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card"
          >
            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="font-body text-sm font-medium flex-1 truncate">
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)}KB
            </span>
            <button
              onClick={() => onFileRemoved(index)}
              className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FileUploadZone;
