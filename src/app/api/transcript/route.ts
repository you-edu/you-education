import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const videoId = url.searchParams.get('videoId');
    const start = parseFloat(url.searchParams.get('start') || '0');
    const end = parseFloat(url.searchParams.get('end') || '0');
    
    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    console.log(`Generating transcript for video: ${videoId}, time range: ${formatTime(start)}-${formatTime(end)}`);
    
    // Generate a mock transcript with better context
    const transcriptText = generateMockTranscript(videoId, start, end);
    
    return NextResponse.json({ transcript: transcriptText });
    
  } catch (error) {
    console.error('Error with transcript:', error);
    return NextResponse.json({ 
      error: 'Failed to generate transcript',
      details: (error as Error).message
    }, { status: 500 });
  }
}

// Format time for logging
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Enhanced mock transcript generator
function generateMockTranscript(videoId: string, start: number, end: number): string {
  const duration = end - start;
  const segments = Math.ceil(duration / 10); // One segment every 10 seconds
  
  let transcript = `Transcript for YouTube video (ID: ${videoId}) from ${formatTime(start)} to ${formatTime(end)}.\n\n`;
  
  // More realistic content based on common educational topics
  const topics = {
    "computerScience": [
      "This section covers the fundamental concepts of algorithms and data structures.",
      "The instructor explains how compilers translate high-level code to machine instructions.",
      "This part demonstrates practical examples of recursive functions and their applications.",
      "Here the video covers important optimization techniques for improving algorithm efficiency.",
      "The lecture discusses time and space complexity analysis using Big O notation.",
      "This segment explains how memory management works in modern programming languages."
    ],
    "mathematics": [
      "The instructor is explaining the concept of differential calculus and its applications.",
      "In this part, the video covers integration techniques and practical examples.",
      "This section demonstrates how to solve complex equations using substitution methods.",
      "The lecturer is explaining matrix operations and their applications in linear algebra.",
      "This segment covers probability theory and statistical analysis techniques.",
      "Here the instructor shows how to apply mathematical concepts to real-world problems."
    ],
    "physics": [
      "This section explains the fundamental principles of quantum mechanics.",
      "The video demonstrates practical applications of Newton's laws of motion.",
      "Here the instructor covers electromagnetic field theory and Maxwell's equations.",
      "This part explains thermodynamic principles and energy conservation.",
      "The lecture discusses relativistic effects and Einstein's theory of relativity.",
      "This segment shows experimental results that confirm theoretical predictions."
    ]
  };
  
  // Choose a random subject area for consistency
  const subjects = Object.keys(topics);
  const selectedSubject = subjects[Math.floor(Math.random() * subjects.length)];
  const selectedTopics = topics[selectedSubject as keyof typeof topics];
  
  for (let i = 0; i < segments; i++) {
    const segmentTime = start + (i * 10);
    const minutes = Math.floor(segmentTime/60);
    const seconds = Math.floor(segmentTime%60).toString().padStart(2, '0');
    const topicIndex = i % selectedTopics.length;
    
    transcript += `[${minutes}:${seconds}] ${selectedTopics[topicIndex]} `;
    
    // Add some filler content for realism
    if (i % 2 === 0) {
      transcript += "The instructor provides examples to clarify these concepts. ";
    } else {
      transcript += "Students are encouraged to think about how this applies to different scenarios. ";
    }
    
    transcript += "\n\n";
  }
  
  return transcript;
}