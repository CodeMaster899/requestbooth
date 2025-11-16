# Overview

RequestBooth is a professional DJ song request system built for live events and performances. The application provides a real-time interface for attendees to submit song requests while giving DJs comprehensive management tools to handle the queue, manage their music library, and control system settings. The platform features user ban management, terms acceptance tracking, and system status controls to ensure smooth event operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and builds
- **UI Library**: Shadcn/UI components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom color scheme and dark mode support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management with real-time updates
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript for type safety across the entire stack
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon serverless driver
- **Authentication**: Session-based authentication for DJ users with bcrypt password hashing
- **Validation**: Zod schemas shared between client and server for consistent validation

## Database Design
- **Songs Table**: Music library with title, artist, genre, duration, and request count tracking
- **Requests Table**: Queue management with support for both library songs and manual requests
- **DJ Users Table**: Authentication for DJ dashboard access
- **Ban List Table**: User ban management with UUID and device fingerprinting
- **Terms Acceptance Table**: Tracks user agreement to terms of service
- **System Settings Table**: Configurable system flags for maintenance mode and request status
- **Sessions Table**: PostgreSQL session storage for authentication persistence

## Core Features
- **Real-time Request Queue**: Live updates every 2-5 seconds for both public and DJ views
- **Dual Request Types**: Library song selection and manual custom requests
- **User Identification**: UUID generation with device fingerprinting for ban enforcement
- **Ban Management**: Comprehensive user banning with automatic request removal
- **System Controls**: DJ-configurable maintenance mode and request enabling/disabling
- **Terms Management**: Required terms acceptance with database tracking

## Desktop Application Features (Tauri 2.0)
- **Windows Native App**: Professional desktop application with .exe installer (MSI/NSIS)
- **Auto-Update System**: Automatic version checking and update installation with signature verification
- **Offline Detection**: Smart connectivity monitoring with user-friendly offline screens
- **Desktop Notifications**: Native Windows notifications for updates, status changes, and alerts
- **Download Page**: Professional installer download page with system requirements and feature comparison
- **Enhanced Performance**: Desktop-optimized performance with offline capabilities

## Responsive Design Features
- **Mobile-First UI**: Optimized layouts for phones, tablets, and desktop screens
- **Touch-Friendly**: Minimum 44px touch targets for mobile interactions
- **Adaptive Cards**: Mobile-specific card layouts with proper spacing and readability
- **Responsive Navigation**: Context-aware navigation adapting to screen size
- **Dark Mode Support**: Comprehensive dark mode with proper color schemes across all breakpoints

## Security & Access Control
- **Public Access**: Song database browsing and request submission
- **DJ Authentication**: Session-based login for administrative functions
- **User Tracking**: Anonymous UUID system with device fingerprinting
- **Ban Enforcement**: Multi-layer blocking using UUID and device fingerprints
- **Input Validation**: Zod schema validation on both client and server

## Real-time Features
- **Queue Updates**: Automatic refresh for live request status changes
- **Status Monitoring**: Real-time system status for maintenance and request availability
- **Request Tracking**: Live updates of queue position and estimated wait times

# External Dependencies

## Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Drizzle Kit**: Database migrations and schema management

## Authentication & Security
- **bcrypt**: Password hashing for DJ user accounts
- **connect-pg-simple**: PostgreSQL session store integration

## UI Components & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Consistent icon set throughout the application

## Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast JavaScript bundler for production builds

## Desktop Application Platform
- **Tauri 2.0**: Rust-based framework for building native Windows applications
- **Tauri Updater Plugin**: Secure auto-update system with ED25519 signature verification
- **Tauri Notification Plugin**: Native Windows notification system integration
- **Tauri Process Plugin**: Application lifecycle and relaunch management

## Form Management & Validation
- **React Hook Form**: Performance-optimized form handling
- **Zod**: Runtime type validation with TypeScript integration
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## State Management
- **TanStack Query**: Server state management with caching and real-time updates
- **Wouter**: Lightweight routing solution for React applications