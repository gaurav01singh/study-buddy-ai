import { collection, doc, setDoc, getDocs, deleteDoc, query } from "firebase/firestore";
import { db } from "./firebase";
import { Subject } from "@/store/app-store";
import { ParsedNote } from "./pdf-parser";

const SUBJECTS_COLLECTION = "subjects";

// Firestore-safe subject (without File objects)
interface FirestoreSubject {
  id: string;
  name: string;
  color: string;
  notes: ParsedNote[];
  fileNames: string[];
}

function toFirestoreSubject(subject: Subject): FirestoreSubject {
  return {
    id: subject.id,
    name: subject.name,
    color: subject.color,
    notes: subject.notes,
    fileNames: subject.files.map((f) => f.name),
  };
}

function fromFirestoreSubject(data: FirestoreSubject): Subject {
  return {
    id: data.id,
    name: data.name,
    color: data.color,
    notes: data.notes || [],
    files: [], // Files can't be stored in Firestore, only metadata
  };
}

export async function saveSubjectToFirestore(subject: Subject): Promise<void> {
  const docRef = doc(db, SUBJECTS_COLLECTION, subject.id);
  await setDoc(docRef, toFirestoreSubject(subject));
}

export async function loadSubjectsFromFirestore(): Promise<Subject[]> {
  const q = query(collection(db, SUBJECTS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => fromFirestoreSubject(doc.data() as FirestoreSubject));
}

export async function deleteSubjectFromFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, SUBJECTS_COLLECTION, id));
}
