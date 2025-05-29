import { User } from '@/lib/db/models';
import { connectToDatabase } from '@/lib/db/mongoose';
import { NextResponse, NextRequest } from 'next/server';


export async function GET(request: NextRequest, {params} : {params: { userId: string }}) {
    try {
        const userId = params.userId; 
        const user = await User.findOne({_id: userId});
        console.log(user);
        
        
        if(user){
            // return user data as JSON with status 200
            return NextResponse.json(user.toObject(), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }else{
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
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
connectToDatabase()
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));