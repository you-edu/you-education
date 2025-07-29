import { User } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase(); // Connect inside the handler
        
        const { name, email, image } = await request.json();
        const newUser = new User({ name, email, image });
        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }
        
        await newUser.save();
        return NextResponse.json(newUser.toObject(), { status: 201 });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();
        
        const { userId, isGeneratingMindMap } = await request.json();
        
        if (!userId || typeof isGeneratingMindMap !== 'boolean') {
            return NextResponse.json(
                { error: 'UserId and isGeneratingMindMap (boolean) are required' }, 
                { status: 400 }
            );
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isGeneratingMindMap },
            { new: true }
        );
        
        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true, 
            isGeneratingMindMap: updatedUser.isGeneratingMindMap 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error updating user mind map status:', error);
        return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }
}