import {Chapter} from '@/lib/db/models';
import {connectToDatabase} from '@/lib/db/mongoose';
import {NextResponse, NextRequest} from 'next/server';

// GET all chapters for a specific exam
export async function GET(request: NextRequest, {params}: {params: {examId: string}}) {
   
    try {
        const {examId} = params;
        if (!examId) {
            return NextResponse.json({error: 'Exam ID is required'}, {status: 400});
        }
       
        const chapters = await Chapter.find({examId}).sort({createdAt: -1}); 
        return NextResponse.json(chapters.map(chapter => chapter.toObject()), {status: 200});
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return NextResponse.json({error: 'Failed to fetch chapters'}, {status: 500});
    }
}

// POST request to create a new chapter
export async function POST(request: NextRequest) {
    try {
        const {examId, title, content, mindMapId} = await request.json();
        const newChapter = new Chapter({examId, title, content, mindMapId});

        // check if chapter already exists
        const existingChapter = await Chapter.findOne({examId, title});
        if (existingChapter) {
            return NextResponse.json({error: 'Chapter already exists'}, {status: 400});
        }

        await newChapter.save();
        return NextResponse.json(newChapter.toObject(), {status: 201});
    } catch (error) {
        console.error('Error creating chapter:', error);
        return NextResponse.json({error: 'Failed to create chapter'}, {status: 500});
    }
}

// Connect to the database
connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
