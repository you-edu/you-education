import { User, UserGenerationStatus } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const { name, email, image } = await request.json();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }
        
        const newUser = new User({ name, email, image });
        await newUser.save();

        // Create status doc (idempotent)
        await UserGenerationStatus.findOneAndUpdate(
            { userId: newUser._id },
            { $setOnInsert: { isGeneratingMindMap: false, isGeneratingQuiz: false, userId: newUser._id, createdAt: new Date() } },
            { upsert: true, new: true }
        );

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
        
        // Update status doc instead of User
        const status = await UserGenerationStatus.findOneAndUpdate(
            { userId },
            { $set: { isGeneratingMindMap, updatedAt: new Date() }, $setOnInsert: { userId, isGeneratingQuiz: false, createdAt: new Date() } },
            { new: true, upsert: true }
        );
        
        if (!status) {
            return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
        }
        
        return NextResponse.json({ 
            success: true, 
            isGeneratingMindMap: status.isGeneratingMindMap 
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error updating user mind map status:', error);
        return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }
}