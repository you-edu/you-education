import {MindMap} from '@/lib/db/models';
import {connectToDatabase} from '@/lib/db/mongoose';
import {NextResponse, NextRequest} from 'next/server';

export async function GET(request: NextRequest, {params}: { params: { mindMapId: string } }) {
    try {
        const mindMapId = params.mindMapId;
        const mindMap = await MindMap.findOne({_id: mindMapId});
        if (mindMap) {
            // return mind map data as JSON with status 200     
            return NextResponse.json(mindMap.toObject(), {status: 200, headers: {'Content-Type': 'application/json'}});
        }
        return NextResponse.json({error: 'Mind map not found'}, {status: 404});
    } catch (error) {
        console.error('Error fetching mind map:', error);
        return NextResponse.json({error: 'Failed to fetch mind map'}, {status: 500});
    }
}


// Delete
export async function DELETE(request: NextRequest, {params}: { params: { mindMapId: string } }) {

    try {
        const mindMapId = params.mindMapId;
        const deletedMindMap = await MindMap.findByIdAndDelete(mindMapId);
        if (deletedMindMap) {
            return NextResponse.json({message: 'Mind map deleted successfully'}, {status: 200});
        }
        return NextResponse.json({error: 'Mind map not found'}, {status: 404});
    } catch (error) {
        console.error('Error deleting mind map:', error);
        return NextResponse.json({error: 'Failed to delete mind map'}, {status: 500});
    }
}

// Update
// not sure if this is correct, but it should work
export async function PUT(request: NextRequest, {params}: { params: { mindMapId: string } }) {
    try {
        const mindMapId = params.mindMapId;
        const updateData = await request.json();
        const updatedMindMap = await MindMap.findByIdAndUpdate(mindMapId, updateData, {new: true});
        if (updatedMindMap) {
            return NextResponse.json(updatedMindMap.toObject(), {status: 200, headers: {'Content-Type': 'application/json'}});
        }
        return NextResponse.json({error: 'Mind map not found'}, {status: 404});
    } catch (error) {
        console.error('Error updating mind map:', error);
        return NextResponse.json({error: 'Failed to update mind map'}, {status: 500});
    }
}

connectToDatabase()
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));


