# NorthEastKrishimitra

A modern web platform empowering farmers and agriculture students across the North East India region with knowledge, tools, market access, and community support.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password)
- **Icons**: Lucide React
- **Routing**: React Router v7

## Project Setup

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git (optional, for version control)

### 2. Environment Configuration

The `.env` file is pre-configured with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are automatically set up during project creation and should not be modified.

### 3. Database Setup

#### Option A: Using Supabase Migrations (Recommended)

The database schema has been automatically applied to your Supabase project through migrations. No additional setup is needed.

#### Option B: Manual SQL Import

If you want to re-create the schema:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor**
4. Create a new query
5. Copy the contents of `supabase/schema.sql` and paste into the editor
6. Click **Run**

**Note**: The schema includes:
- `profiles` table (linked to auth.users)
- `admins` table (for admin access control)
- `services`, `trainings`, `shop_items`, `about_content`, `contact_info` tables
- Row Level Security (RLS) policies for data protection
- Sample seed data

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 6. Build for Production

```bash
npm run build
```

Output is in the `dist/` folder, ready for deployment.

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx          # Navigation with auth state
│   ├── Footer.tsx          # Platform footer
│   └── ProtectedRoute.tsx  # Auth-guarded routes
├── context/
│   └── AuthContext.tsx     # Global auth state management
├── lib/
│   └── supabase.ts         # Supabase client & TypeScript types
├── pages/
│   ├── Home.tsx            # Landing page with hero section
│   ├── About.tsx           # About Us with team & milestones
│   ├── Services.tsx        # Services directory
│   ├── Training.tsx        # Training programs listing
│   ├── Shop.tsx            # E-commerce product catalog
│   ├── Contact.tsx         # Contact form & info
│   ├── Dashboard.tsx       # User profile dashboard
│   ├── auth/
│   │   ├── Login.tsx       # Login form
│   │   └── SignUp.tsx      # Registration form
│   └── admin/
│       └── AdminDashboard.tsx  # Admin panel
├── App.tsx                 # Main routing & layout
├── main.tsx                # React entry point
└── index.css               # Global Tailwind styles
```

## Key Features

### Public Pages
- **Home**: Hero section, services overview, testimonials, CTAs
- **About**: Company story, team, milestones, values, certifications
- **Services**: Crop advisory, soil testing, weather, market linkage, subsidies, community
- **Training**: Hands-on programs in organic farming, irrigation, agri-business
- **Shop**: Quality agri-inputs (seeds, fertilizers, equipment, pesticides)
- **Contact**: Dynamic contact info, contact form

### Authentication
- Email/Password sign-up and login
- Role selection (Farmer or Agriculture Student)
- Automatic profile creation on sign-up
- Protected routes for logged-in users

### User Dashboard
- View and edit profile information
- Mobile number, address, role management
- Sign-out functionality

### Admin Dashboard
- Overview statistics (users, content, products)
- Quick action links to manage platform content
- (Full CRUD functionality ready for expansion)

## Database Schema Overview

### Tables
- **profiles**: User account details (full_name, mobile_number, address, role)
- **admins**: Admin user tracking
- **services**: Platform services with icons
- **trainings**: Training program listings
- **shop_items**: Product catalog with pricing
- **about_content**: Dynamic About Us page content
- **contact_info**: Contact details and social links

### Security
- All tables have Row Level Security (RLS) enabled
- Users can only view/edit their own profiles
- Public content tables allow authenticated reads
- Only admins can manage platform content
- is_admin() helper function for policy checks

## Seed Data

The database is pre-populated with sample data:
- 6 core services
- 4 training programs
- 4 agri-shop products
- About Us description
- Contact information

## Authentication Flow

1. **Sign Up**: New users fill out registration with role selection
2. **Trigger**: Auth hook auto-creates profile row in `profiles` table
3. **Login**: Email/password authentication via Supabase
4. **Protected Routes**: `/dashboard` and `/admin` require authentication
5. **Admin Access**: Only users in `admins` table can access `/admin`

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub repository
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Vercel auto-detects Vite configuration
5. Environment variables are pre-configured
6. Click Deploy

### Deploy to Other Platforms

The `dist/` folder from `npm run build` can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting
- Any static hosting service

## Development Tips

### Adding New Content Types
1. Create migration in `supabase/migrations/`
2. Update types in `src/lib/supabase.ts`
3. Create corresponding page component
4. Add route in `src/App.tsx`

### Styling
- All styling uses Tailwind CSS
- Custom colors use green theme (#16a34a and variants)
- Use 8px spacing system (p-1 = 0.25rem = 2px, p-4 = 1rem = 16px, etc.)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px)

### Icons
- All icons from Lucide React
- Icon names: `<ChevronRight />`, `<Leaf />`, `<Users />`, etc.
- See [Lucide Docs](https://lucide.dev) for full list

## Troubleshooting

### "Database connection error"
- Verify `.env` contains correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Check Supabase project status in dashboard

### "RLS policy denies access"
- Ensure you're logged in for protected routes
- Check user role and admin status in auth context
- Verify RLS policies in Supabase SQL Editor

### "Build errors"
- Run `npm install` to ensure all dependencies
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Run `npm run typecheck` to verify TypeScript

## Next Steps

1. **Customize branding**: Update logo, colors, company info
2. **Add email notifications**: Integrate Sendgrid or similar
3. **Implement payments**: Add Stripe for shop checkout
4. **Complete admin CRUD**: Build full content management interface
5. **Add more features**: SMS alerts, video training, webinars, API
6. **Deploy**: Push to production hosting

## Support

For Supabase documentation: https://supabase.com/docs
For Tailwind CSS: https://tailwindcss.com/docs
For React Router: https://reactrouter.com/docs

---

**Built with ❤️ for NorthEastKrishimitra**
