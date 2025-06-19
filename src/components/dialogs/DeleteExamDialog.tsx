import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

// Random words for confirmation
const CONFIRMATION_WORDS = [
  'delete', 'confirm', 'remove', 'erase', 'dispose',
  'purge', 'eliminate', 'destroy', 'discard', 'cancel'
];

interface DeleteExamDialogProps {
  examId: string;
  examName: string;
}

export function DeleteExamDialog({ examId, examName }: DeleteExamDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationWord, setConfirmationWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const router = useRouter();

  // Generate a random confirmation word when dialog opens
  useEffect(() => {
    if (open) {
      const randomIndex = Math.floor(Math.random() * CONFIRMATION_WORDS.length);
      setConfirmationWord(CONFIRMATION_WORDS[randomIndex]);
      setUserInput('');
    }
  }, [open]);

  const handleDelete = async () => {
    if (userInput.toLowerCase() !== confirmationWord.toLowerCase()) {
      toast.error('The confirmation word does not match.');
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/exams/${examId}`);
      
      toast.success('Exam deleted successfully');
      setOpen(false);
      // Redirect to homepage
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="icon" className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-500">Delete Exam</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete {examName} and all its associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 rounded-md my-2">
          <p className="text-sm text-center">
            Type <span className="font-bold text-red-600">{confirmationWord}</span> to confirm
          </p>
        </div>
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`Type "${confirmationWord}" here`}
          className="mt-2"
        />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting || userInput.toLowerCase() !== confirmationWord.toLowerCase()}
          >
            {isDeleting ? 'Deleting...' : 'Delete Exam'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

