import {Notes} from '@/lib/db/models';
import {connectToDatabase} from '@/lib/db/mongoose';
import {NextResponse, NextRequest} from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { content} = await request.json();
        const newNote = new Notes({content});

        await newNote.save();
        return NextResponse.json(newNote.toObject(), {status: 201});
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json({error: 'Failed to create note'}, {status: 500});
    }
}

// Connect to the database
connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
