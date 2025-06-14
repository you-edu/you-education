import { Chapter } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';

// GET all chapters for a specific exam
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const examId = searchParams.get('examId');
        
        if (!examId) {
            return NextResponse.json({ error: 'examId is required' }, { status: 400 });
        }

        // Find all chapters associated with this exam
        const chapters = await Chapter.find({ examId: examId });
        return NextResponse.json(chapters, { status: 200 });
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return NextResponse.json({error: 'Failed to fetch chapters'}, {status: 500});
    }
}

// POST request to create a new chapters for an exam
export async function POST(request: NextRequest) {
    try {
        const {examId, chapters} = await request.json();
        if (!examId || !chapters || !Array.isArray(chapters)) {
            return NextResponse.json({error: 'Invalid request data'}, {status: 400});
        }
        
        // console.log('Creating chapters for exam:', examId, 'Chapters:', chapters);
        // Create new chapters in the database
        const createdChapters = await Chapter.insertMany(
            chapters.map(chapter => ({...chapter, examId }))
        );
        // console.log('Chapters created successfully:', createdChapters);
        return NextResponse.json(createdChapters.map(chapter => chapter.toObject()), {status: 201});
    } catch (error) {
        console.error('Error creating chapters:', error);
        return NextResponse.json({error: 'Failed to create chapters'}, {status: 500});
    }
}

// Connect to the database
connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
