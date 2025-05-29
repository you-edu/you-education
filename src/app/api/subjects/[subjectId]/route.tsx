import { Subject } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { subjectId: string } }) {
    try {
        const subjectId = params.subjectId;
        const subject = await Subject.findOne({ _id: subjectId });

        if (subject) {
            // return subject data as JSON with status 200
            return NextResponse.json(subject.toObject(), { status: 200, headers: { 'Content-Type': 'application/json' } });
        } else {
            return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching subject:', error);
        return NextResponse.json({ error: 'Failed to fetch subject' }, { status: 500 });
    }
}
export async function POST(request: NextRequest) {  
    try {
        const { userId, title, description } = await request.json();
        const newSubject = new Subject({ userId, title, description });

        // check if subject already exists
        const existingSubject = await Subject.findOne({ userId, title });
        if (existingSubject) {
            return NextResponse.json({ error: 'Subject already exists' }, { status: 400 });
        }

        await newSubject.save();
        return NextResponse.json(newSubject.toObject(), { status: 201 });
    } catch (error) {
        console.error('Error creating subject:', error);
        return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
    }
}

// Delete
export async function DELETE(request: NextRequest, { params }: { params: { subjectId: string } }) {
    try {
        const subjectId = params.subjectId;
        const deletedSubject = await Subject.findByIdAndDelete(subjectId);
        if (deletedSubject) {
            return NextResponse.json({ message: 'Subject deleted successfully' }, { status: 200 });
        }
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    } catch (error) {
        console.error('Error deleting subject:', error);
        return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
    }
}

// Update
// not sure if this is correct, but it should work
export async function PUT(request: NextRequest, { params }: { params: { subjectId: string } }) {
    try {
        const subjectId = params.subjectId;
        const updateData = await request.json();
        const updatedSubject = await Subject.findByIdAndUpdate(subjectId, updateData, { new: true });
        if (updatedSubject) {
            return NextResponse.json(updatedSubject.toObject(), { status: 200 });
        }
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    } catch (error) {
        console.error('Error updating subject:', error);    
        return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
    }
}



// Connect to the database
connectToDatabase()
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));