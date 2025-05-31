import { Subject } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";



export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // This will extract and verify the session token from cookies/headers
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    // Fetch subjects for this user only
    const subjects = await Subject.find({ userId: token.id });
    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
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