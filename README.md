# iCal Parser

A modern, full-stack web application for parsing, managing, and synchronizing calendar events across different platforms. Built with Next.js 14, this application provides a robust solution for handling iCal (.ics) files, managing calendar events, and integrating with various calendar providers through a sleek, responsive interface.

## Core Features

### Calendar Management 📅
- **iCal Parsing**: Import and parse .ics files with automatic event extraction
- **Event Grid**: Advanced data grid with sorting, filtering, and pagination
- **Real-time Updates**: Live event updates using Supabase real-time subscriptions
- **Export Functionality**: Export events to CSV with formatted timestamps

### Calendar Synchronization 🔄
- **Multi-provider Support**:
  - Google Calendar integration
  - Outlook Calendar support
  - iCal feed synchronization
- **Sync Settings**:
  - Configurable sync intervals
  - Provider-specific settings
  - Sync history tracking
  - Error handling and retry logic

### Webhook System 🔗
- **Flexible Integration**:
  - Custom webhook endpoints
  - Configurable event triggers
  - Secure webhook authentication
- **Monitoring**:
  - Real-time execution history
  - Status tracking and error logging
  - Performance metrics
  - Retry mechanisms

### Dashboard & Analytics 📊
- **Event Overview**:
  - Upcoming events display
  - Recent uploads section
  - Activity feed
- **Real-time Stats**:
  - Total events counter
  - Active webhooks tracking
  - Sync status indicators

### User Interface 🎨
- **Modern Design**:
  - Clean, responsive layout
  - Dark/light mode support
  - Smooth animations
  - Loading states and skeletons
- **Interactive Components**:
  - Dynamic data grids
  - Modal dialogs
  - Toast notifications
  - Form validations

## Technical Architecture

### Frontend Architecture
- **Next.js 14 App Router**:
  - Server and client components
  - API routes for backend functionality
  - Middleware for auth protection
  - Static and dynamic rendering

- **React & TypeScript**:
  - Strict type checking
  - Custom hooks for shared logic
  - Context providers for state
  - Error boundaries

- **UI Components**:
  - Shadcn UI integration
  - TailwindCSS styling
  - Responsive design patterns
  - Accessibility features

### Backend Architecture
- **Supabase Integration**:
  - PostgreSQL database
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Authentication system

- **Data Models**:
  \`\`\`typescript
  // Calendar Events
  interface CalendarEvent {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    status: 'confirmed' | 'tentative' | 'cancelled';
    createdAt: string;
  }

  // Webhook Configuration
  interface Webhook {
    id: string;
    name: string;
    url: string;
    active: boolean;
    events: string[];
    createdAt: string;
  }

  // Sync Settings
  interface CalendarSyncSetting {
    id: string;
    provider: 'google' | 'outlook' | 'ical';
    calendarId: string;
    isActive: boolean;
    syncInterval: number;
  }
  \`\`\`

## Project Structure

\`\`\`
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API route handlers
│   ├── auth/              # Authentication pages
│   ├── calendar/          # Calendar views
│   ├── dashboard/         # Dashboard components
│   ├── events/           # Event management
│   └── settings/         # App settings
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   │   ├── button.tsx    # Button component
│   │   ├── card.tsx      # Card component
│   │   └── ...          # Other UI components
│   ├── calendar/         # Calendar components
│   │   ├── calendar-grid.tsx    # Event grid
│   │   ├── calendar-sync.tsx    # Sync management
│   │   └── calendar-export.tsx  # Export functionality
│   ├── webhooks/         # Webhook components
│   │   ├── webhook-list.tsx     # Webhook management
│   │   └── webhook-history.tsx  # Execution history
│   └── dashboard/        # Dashboard components
│       ├── recent-uploads.tsx   # Recent activity
│       └── upcoming-events.tsx  # Event preview
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase client & types
│   ├── utils/           # Helper functions
│   └── services/        # Business logic
├── types/               # TypeScript definitions
└── hooks/               # Custom React hooks
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account
- npm or yarn package manager

### Installation Steps

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/icalparser.git
cd icalparser
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your Supabase credentials in \`.env.local\`:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

5. Set up the database schema:
   - Import the provided SQL schema
   - Enable row level security
   - Configure authentication providers

6. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components
- Implement proper error handling
- Write meaningful comments
- Follow the DRY principle

### Component Structure
- Separate business logic from UI
- Use proper type definitions
- Implement error boundaries
- Handle loading states

### State Management
- Use React Context for global state
- Implement proper data fetching
- Handle real-time updates
- Manage loading states

## Contributing

1. Fork the repository
2. Create your feature branch:
\`\`\`bash
git checkout -b feature/amazing-feature
\`\`\`
3. Commit your changes:
\`\`\`bash
git commit -m 'Add some amazing feature'
\`\`\`
4. Push to the branch:
\`\`\`bash
git push origin feature/amazing-feature
\`\`\`
5. Open a Pull Request

### Pull Request Guidelines
- Follow the existing code style
- Add proper documentation
- Include tests where necessary
- Update the README if needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.io/) - Backend as a Service
- [Shadcn UI](https://ui.shadcn.com/) - UI Component library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Lucide Icons](https://lucide.dev/) - Icon library
- [date-fns](https://date-fns.org/) - Date utility library
- [Framer Motion](https://www.framer.com/motion/) - Animation library
