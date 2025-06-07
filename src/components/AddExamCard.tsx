"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"

interface AddExamCardProps {
  onSave: (examData: ExamData) => void
  onCancel: () => void
}

export interface ExamData {
  userId: string;
  subjectName: string;
  description: string;
  createdAt: Date;
  examDate: Date;
}

export function AddExamCard({ onSave, onCancel }: AddExamCardProps) {
  const [subjectName, setSubjectName] = useState("")
  const [description, setDescription] = useState("")
  const [examDate, setExamDate] = useState<Date>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const examData: ExamData = {
      userId: useSession().data?.user?.id || "", 
      subjectName: subjectName,
      description: description,
      createdAt: new Date(),
      examDate: examDate || new Date(),
    }
    onSave(examData)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg bg-white dark:bg-black/90 border-2 border-gray-100 dark:border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle>Add New Exam</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Subject Name</Label>
            <Input 
              id="subject-name" 
              placeholder="Enter subject name" 
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
              className="border border-gray-200 dark:border-white/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="exam-description">Description</Label>
            <Textarea 
              id="exam-description" 
              placeholder="Enter exam description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] border border-gray-200 dark:border-white/20"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Exam Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border border-gray-200 dark:border-white/20",
                    !examDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {examDate ? format(examDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={examDate}
                  onSelect={setExamDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            type="button" 
            onClick={onCancel}
            className="border border-gray-200 dark:border-white/20"
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Save Exam
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
