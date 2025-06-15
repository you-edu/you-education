import { NextResponse, NextRequest } from 'next/server';
import { Notes } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';

// POST - Create a new notes document
export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Notes content is required' }, { status: 400 });
    }
    
    const newNotes = new Notes({ content });
    await newNotes.save();
    
    return NextResponse.json(newNotes.toObject(), { status: 201 });
  } catch (error) {
    console.error('Error creating notes:', error);
    return NextResponse.json({ error: 'Failed to create notes' }, { status: 500 });
  }
}

// GET - Retrieve notes by ID
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Notes ID is required' }, { status: 400 });
    }
    
    const notes = await Notes.findById(id);
    if (!notes) {
      return NextResponse.json({ error: 'Notes not found' }, { status: 404 });
    }
    
    return NextResponse.json(notes.toObject(), { status: 200 });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}
