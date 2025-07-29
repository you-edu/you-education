import { User } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        
        if (!email) {
            return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
        }
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json(user.toObject(), { status: 200 });
        
    } catch (error) {
        console.error('Error fetching user by email:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}