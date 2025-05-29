import {Notes} from '@/lib/db/models';
import {connectToDatabase} from '@/lib/db/mongoose';
import {NextResponse, NextRequest} from 'next/server';

export async function GET(request: NextRequest, {params}: { params: { noteId: string } }) {
    try {
        const noteId = params.noteId;
        const note = await Notes.findOne({_id: noteId});
        if (note) {
            // return note data as JSON with status 200
            return NextResponse.json(note.toObject(), {status: 200, headers: {'Content-Type': 'application/json'}});
        }
        return NextResponse.json({error: 'Note not found'}, {status: 404});
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json({error: 'Failed to fetch note'}, {status: 500});
    }
}

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

// Delete

export async function DELETE(request: NextRequest, {params}: { params: { noteId: string } }) {
    try {
        const noteId = params.noteId;
        const deletedNote = await Notes.findByIdAndDelete(noteId);
        if (deletedNote) {
            return NextResponse.json({message: 'Note deleted successfully'}, {status: 200});
        }
        return NextResponse.json({error: 'Note not found'}, {status: 404});
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json({error: 'Failed to delete note'}, {status: 500});
    }
}

// Update
// not sure if this is correct, but it should work
export async function PUT(request: NextRequest, {params}: { params: { noteId: string } }) {
    try {
        const noteId = params.noteId;
        const updateData = await request.json();
        const updatedNote = await Notes.findByIdAndUpdate(noteId, updateData, {new: true});
        if (updatedNote) {
            return NextResponse.json(updatedNote.toObject(), {status: 200});
        }
        return NextResponse.json({error: 'Note not found'}, {status: 404});
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json({error: 'Failed to update note'}, {status: 500});
    }
}

// Connect to the database
connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
