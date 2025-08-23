# APDE - Web Campaign Management Platform

A comprehensive marketing campaign management platform built with React Router. Create, manage, and optimize your marketing campaigns with powerful analytics, landing page builder, and prospect management tools.

## Features

- 📊 **Advanced Analytics** - Real-time campaign performance tracking with detailed insights
- 🎯 **Campaign Management** - Organize and track multiple campaigns with automated workflows
- 📄 **Landing Page Builder** - Create high-converting landing pages with customizable components
- 👥 **Prospect Management** - Organize and nurture leads with filtering and segmentation
- 📧 **Email Campaign Automation** - Automated email sequences with progress tracking
- 📱 **Responsive Design** - Modern UI built with Tailwind CSS and shadcn/ui components
- 🔒 **TypeScript** - Full type safety throughout the application

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run typecheck` - Run TypeScript type checking and generate route types
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run knip` - Find unused files, dependencies and exports
- `npm run fix` - Run typecheck, lint:fix and knip in sequence
- `npx serve build/client -p 3000 -s` - Run production

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── columns/        # Data table column definitions
│   └── ...
├── routes/             # Application routes
│   ├── admin/          # Admin dashboard routes
│   ├── home.tsx        # Marketing homepage
│   ├── login.tsx       # Authentication
│   └── landingpage.tsx # Public landing pages
├── lib/                # Utilities and types
├── hooks/              # Custom React hooks
└── services/           # API service layer
```

## Key Technologies

- **React Router v7** - Full-stack React framework
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible, customizable components built on Radix UI
- **Recharts** - Data visualization
- **Tanstack Table** - Advanced data tables

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Admin Dashboard

The platform includes a comprehensive admin dashboard with:

- **Dashboard Overview** - Campaign performance metrics and analytics charts
- **Campaign Management** - Create, edit, and monitor marketing campaigns
- **Landing Page Builder** - Visual editor for creating custom landing pages
- **Prospect Management** - Lead database with advanced filtering and segmentation
- **Campaign Outbox** - Email campaign automation and tracking

Access the admin panel at `/admin/login` after starting the application.

## API Integration

The frontend is designed to work with a backend API that provides:
- Campaign management endpoints
- Prospect data and filtering
- Landing page content management
- Analytics and reporting data
- Email automation services

---

Built with ❤️ using React Router and modern web technologies.
