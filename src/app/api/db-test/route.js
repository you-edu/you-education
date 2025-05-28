/**
 * API endpoint to test database connection
 */

import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/models';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Count users to test the connection
    const count = await User.countDocuments();
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection successful', 
      userCount: count 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message }, 
      { status: 500 }
    );
  }
}
