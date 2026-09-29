# CityCircle Setup Guide

## What's Been Implemented

### ✅ Core Infrastructure
- Next.js 16.3.4 with App Router
- TypeScript configuration
- Tailwind CSS v4 with shadcn/ui components
- Supabase client setup (browser and server)
- PWA configuration (manifest.json, service worker)
- Project folder structure following PRD

### ✅ Database Schema
- Complete PostgreSQL schema with PostGIS extension
- Tables: users, groups, group_members, meetups, rsvps, sponsors, sponsor_banners, reports, location_data, founding_codes
- Row Level Security (RLS) policies for all tables
- Indexes for performance
- Triggers for updated_at timestamps

### ✅ Authentication Flow
- Email OTP verification system
- OTP storage (in-memory, ready for Redis migration)
- Profile setup with interest tags
- Founding member code validation
- Welcome email functionality

### ✅ User Interface
- Landing page with value proposition
- Sign up page with email OTP flow
- Profile setup page with interest tag selection
- Member dashboard with navigation
- Groups listing page with category filters
- Placeholder pages for meetups, map, and profile

### ✅ API Routes
- `/api/auth/send-otp` - Send verification code via email
- `/api/auth/verify-otp` - Verify OTP and issue token
- `/api/auth/create-user` - Create user profile after verification
- `/api/groups` - GET/POST for groups management

## What's Still Needed

### 🔧 Configuration Required
1. **Supabase Setup**
   - Create a Supabase project
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - Copy project URL and anon key to `env.local`
   - Generate service role key for admin operations

2. **Email Configuration**
   - Set up SMTP credentials (Gmail recommended for development)
   - Configure in `env.local`:
     ```
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your_email@gmail.com
     SMTP_PASSWORD=your_app_password
     SMTP_FROM=CityCircle <noreply@citycircle.com>
     ```

3. **Environment Variables**
   - Copy `env.example` to `.env.local`
   - Fill in all required values:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=your_email@gmail.com
     SMTP_PASSWORD=your_app_password
     SMTP_FROM=CityCircle <noreply@citycircle.com>
     NEXT_PUBLIC_APP_URL=http://localhost:3000
     NEXT_PUBLIC_CITY=Surat
     ```

### 🚧 Features to Implement

#### High Priority (Week 1-2)
- [ ] Proper Supabase Auth integration (replace temporary OTP flow)
- [ ] Founding member code generation script
- [ ] Group join request/approval flow
- [ ] Group detail page with chat integration
- [ ] Member list within groups

#### Medium Priority (Week 3-4)
- [ ] Stream Chat integration
- [ ] Image upload to ImageKit
- [ ] Image moderation flow
- [ ] Web push notifications
- [ ] Meetups creation and RSVP

#### Lower Priority (Week 5-8)
- [ ] Map implementation (MapLibre GL JS)
- [ ] Location fuzzing server-side
- [ ] People layer with opt-in
- [ ] Razorpay payment integration
- [ ] Admin area with moderation queue
- [ ] Sponsor banner management

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Database Management

To apply the migration to your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the SQL script

Or use Supabase CLI:
```bash
supabase db push
```

## Testing the App

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Click "Join Now" to test signup flow
4. Enter email (must have SMTP configured)
5. Enter OTP (check console or email logs)
6. Complete profile setup
7. Navigate to dashboard and groups

## Notes

- The current OTP flow uses in-memory storage (not suitable for production)
- Founding member codes need to be manually inserted into the database
- ImageKit and Stream Chat accounts need to be set up
- The app is currently in development mode with relaxed auth checks
- PWA install prompt will appear on mobile devices after proper HTTPS setup

## Next Steps

1. Set up Supabase project and apply migrations
2. Configure email SMTP for OTP testing
3. Test the complete signup flow
4. Implement proper Supabase Auth
5. Add Stream Chat for group messaging
6. Build out remaining features per PRD timeline
