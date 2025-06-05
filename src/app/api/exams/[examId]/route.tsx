import { Exam } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { examId: string } }) {
    try {
        const examId = params.examId;
        const exam = await Exam.findOne({ _id: examId });

        if (exam) {
            // return exam data as JSON with status 200
            return NextResponse.json(exam.toObject(), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching exam:', error);
        return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
    }
}


// Delete
export async function DELETE(request: NextRequest, { params }: { params: { examId: string } }) {
    try {
        const examId = params.examId;
        const deletedExam = await Exam.findByIdAndDelete(examId);
        if (deletedExam) {
            return NextResponse.json({ message: 'Exam deleted successfully' }, { status: 200 });
        }
        return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting Exam:', error);
        return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
    }
}

// Update
// not sure if this is correct, but it should work
export async function PUT(request: NextRequest, { params }: { params: { examId: string } }) {
    try {
        const examId = params.examId;
        const updateData = await request.json();
        const updatedExam = await Exam.findByIdAndUpdate(examId, updateData, { new: true });
        if (updatedExam) {
            return NextResponse.json(updatedExam.toObject(), { status: 200 });
        }
        return NextResponse.json({ error: 'exam not found' }, { status: 404 });
    } catch (error) {
        console.error('Error updating exam:', error);    
        return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
    }
}



// Connect to the database
connectToDatabase()
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));