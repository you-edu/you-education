import {NextResponse, NextRequest} from 'next/server';
import {MindMap} from '@/lib/db/models';
import {connectToDatabase} from '@/lib/db/mongoose';

// post
export async function POST(request: NextRequest) {
    try {
        const {chapterId, content} = await request.json();
        const newMindMap = new MindMap({chapterId, content});

        // check if mind map already exists
        const existingMindMap = await MindMap.findOne({chapterId});
        if (existingMindMap) {
            return NextResponse.json({error: 'Mind map already exists'}, {status: 400});
        }

        await newMindMap.save();
        return NextResponse.json(newMindMap.toObject(), {status: 201});
    } catch (error) {
        console.error('Error creating mind map:', error);
        return NextResponse.json({error: 'Failed to create mind map'}, {status: 500});
    }
}

// connect to database
connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));


