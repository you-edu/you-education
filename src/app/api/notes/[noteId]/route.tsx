import {Notes} from '@/lib/db/models';
import {connectToDatabase} from '@/lib/db/mongoose';
import {NextResponse, NextRequest} from 'next/server';

export async function GET(request: NextRequest, {params}: { params: { noteId: string } }) {
    try {
        const noteId = await params.noteId;
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
export async function PUT(request: NextRequest, { params }: { params: { noteId: string } }) {
  try {
    await connectToDatabase();
    
    const noteId = params.noteId;
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const updatedNotes = await Notes.findByIdAndUpdate(
      noteId,
      { content },
      { new: true }
    );
    
    if (!updatedNotes) {
      return NextResponse.json({ error: 'Notes not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedNotes.toObject(), { status: 200 });
    
  } catch (error) {
    console.error("Error updating notes:", error);
    return NextResponse.json(
      { error: "Failed to update notes" },
      { status: 500 }
    );
  }
}

// Connect to the database
connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
