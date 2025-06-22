# YouEducation 🎓

A comprehensive educational platform that transforms traditional learning through **AI-powered mind maps**, interactive video content, and intelligent note generation. YouEducation makes complex subjects accessible by organizing educational content into visual, hierarchical structures with integrated YouTube videos and automatically generated study notes.

---

## 🌟 Features

### 🧠 AI-Powered Mind Maps
- **Intelligent Content Organization**: Automatically generates hierarchical mind maps from educational syllabi
- **Multi-Level Structuring**: Creates deep, nested topic hierarchies for comprehensive subject coverage
- **Visual Learning**: Interactive mind map visualization with expandable/collapsible nodes
- **Resource Integration**: Seamlessly embeds YouTube videos and study notes within mind map nodes

### 📚 Smart Content Generation
- **Syllabus Extraction**: Upload syllabus images to automatically extract chapters and topics using Azure OpenAI Vision
- **YouTube Video Integration**: Automatically finds and curates relevant educational videos for each topic
- **AI-Generated Notes**: Creates comprehensive study notes for complex topics using advanced language models
- **Balanced Resource Distribution**: Intelligently balances video content (~67%) and written notes (~33%) for optimal learning

### 🎥 Enhanced Video Experience
- **Integrated Video Player**: Custom video player with transcript generation
- **Time-Stamped Transcripts**: Mock transcript generation with educational context
- **Interactive Chat**: AI-powered chat interface for asking questions about video content
- **Contextual Learning**: Chat responses based on specific video segments and content

### 📝 Advanced Note Management
- **Markdown Support**: Rich text formatting with full markdown compatibility
- **Full-Screen Mode**: Distraction-free reading experience
- **Responsive Design**: Optimized for all device sizes
- **Auto-Save**: Automatic saving and retrieval of generated notes

### 🔐 User Management
- **NextAuth Integration**: Secure authentication system
- **Session Management**: Persistent user sessions across devices
- **Personalized Experience**: User-specific content and progress tracking

---

## 🚀 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Markmap**: Interactive mind map visualization
- **Lucide React**: Modern icon library
- **Sonner**: Toast notifications

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB**: Document database with Mongoose ODM
- **Azure OpenAI**: GPT-4 integration for content generation
- **NextAuth.js**: Authentication and session management

### External Services
- **Azure OpenAI**: Advanced AI language models
- **YouTube API**: Video content integration
- **Vercel**: Deployment and hosting platform

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── chat/                 # AI chat functionality
│   │   ├── mind-maps/            # Mind map CRUD operations
│   │   ├── notes/                # Notes management
│   │   ├── syllabus/             # Syllabus processing
│   │   └── transcript/           # Video transcript generation
│   ├── exams/                    # Exam management pages
│   ├── login/                    # Authentication pages
│   └── signup/
├── components/                   # Reusable React components
│   ├── mindMapGenerator/         # Mind map generation logic
│   │   ├── index.ts              # Main orchestration
│   │   ├── youtubeVideoAdder.ts  # YouTube integration
│   │   ├── releventVideoSelector.ts # Video curation
│   │   ├── notesAdder.ts         # Notes generation
│   │   └── testNotesAdder.ts     # Testing utilities
│   ├── ui/                       # UI components
│   ├── Mindmap.tsx               # Mind map visualization
│   ├── NotesViewer.tsx           # Notes display component
│   ├── VideoPlayer.tsx           # Custom video player
│   └── ChatUI.tsx                # AI chat interface
├── context/                      # React contexts
├── lib/                          # Utility functions and database
│   ├── db/                       # Database models and connection
│   └── utils.ts                  # Helper functions
└── types/                        # TypeScript type definitions
```

---

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/you-education.git
   cd you-education
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Azure OpenAI
   AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key
   AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
   OPENAI_API_VERSION=2024-12-01-preview

   # NextAuth
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000

   # Authentication Providers (configure as needed)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the result.

---

## 🎯 Usage

### Creating a Mind Map

1. **Upload Syllabus**: Upload an image of your course syllabus
2. **Automatic Processing**: The system extracts chapters and topics using AI
3. **Content Generation**: YouTube videos are automatically curated for each topic
4. **Mind Map Creation**: A hierarchical mind map is generated with integrated resources
5. **Notes Generation**: AI creates comprehensive study notes for complex topics

### Exploring Content

- **Navigate Mind Maps**: Click on topics to expand/collapse sections
- **Watch Videos**: Click on video nodes to open the integrated player
- **Read Notes**: Click on note nodes to view AI-generated study materials
- **Interactive Chat**: Ask questions about specific content using the AI chat feature

### Managing Studies

- **Save Progress**: All generated content is automatically saved
- **Full-Screen Mode**: Use distraction-free mode for focused study
- **Cross-Device Sync**: Access your content across all devices

---

## 🧪 Testing

The project includes comprehensive testing utilities:

```bash
# Run the mind map generation test
npm run test:mindmap

# Test notes generation functionality
npm run test:notes
```

Visit `/checker` in your browser for interactive testing of core functionality.

---

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Connect your GitHub repository to Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy automatically on git push

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Manual Deployment

```bash
npm run build
npm start
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 API Reference

### Mind Map Generation

- `POST /api/mind-maps` - Create a new mind map
- `GET /api/mind-maps/[id]` - Retrieve a specific mind map
- `POST /api/mind-maps/generate` - Generate mind map from topics

### Notes Management

- `POST /api/notes` - Create new notes
- `GET /api/notes/[id]` - Retrieve specific notes
- `POST /api/mind-maps/notes` - Generate AI notes

### Content Processing

- `POST /api/syllabus` - Process syllabus images
- `GET /api/transcript` - Generate video transcripts
- `POST /api/chat` - AI chat functionality

---

## 🔧 Configuration

### Azure OpenAI Setup

1. Create an Azure OpenAI resource
2. Deploy a GPT-4 model
3. Configure API keys and endpoints in environment variables

### Database Setup

1. Create a MongoDB database (MongoDB Atlas recommended)
2. Configure connection string in environment variables
3. Models will be automatically created on first run

---

## 📊 Performance Features

- **Optimized Loading**: Lazy loading of mind map components
- **Caching**: Intelligent caching of generated content
- **Responsive Design**: Optimized for all screen sizes
- **Error Handling**: Comprehensive error handling and recovery

---

## 🎨 Customization

### Themes

- Built-in dark/light mode support
- Customizable color schemes
- Responsive design patterns

### Mind Map Styling

- Modify `styles/MindMap.module.css` for custom styling
- Configurable node colors and animations
- Customizable interaction patterns

---

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Azure OpenAI Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - feedback and contributions are welcome!

---

## 📚 Educational Benefits

- **Visual Learning**: Mind maps cater to visual learners
- **Structured Content**: Hierarchical organization improves comprehension
- **Multi-Modal Learning**: Combines video, text, and visual elements
- **AI-Powered Insights**: Intelligent content curation and generation
- **Personalized Experience**: Adaptive learning based on user interactions

---

## 🔒 Security

- Secure authentication with NextAuth.js
- Environment variable protection
- API rate limiting
- Input validation and sanitization

---

## 📱 Mobile Support

- Fully responsive design
- Touch-optimized interactions
- Mobile-first approach
- Progressive Web App features

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/you-education/issues) section
2. Create a new issue with detailed information
3. Join our community discussions

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](L    ICENSE) file for details.

---

## 🙏 Acknowledgments

- **Azure OpenAI** for advanced AI capabilities
- **Markmap** for mind map visualization
- **Next.js** team for the excellent framework
- **Vercel** for deployment platform
- All contributors and users of the platform

---

**Built with ❤ for better education**

Transform your learning experience with YouEducation - where AI meets education to create personalized, visual, and interactive learning.



