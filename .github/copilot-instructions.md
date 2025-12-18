# AI Coding Agent Guidelines for YouTube2025

Welcome to the YouTube2025 codebase! This document provides essential knowledge to help AI coding agents be productive and follow project conventions.

## Big Picture Architecture

- **Framework**: This project is built with Next.js (App Router) and TypeScript.
- **UI Components**: Uses Shadcn UI components extensively for consistent design.
- **State Management**: Relies on TRPC for server-client communication.
- **Database**: Drizzle ORM is used for database interactions.
- **Authentication**: Clerk is integrated for user authentication.
- **File Uploads**: UploadThing handles file uploads.
- **Video Hosting**: Mux is used for video streaming and hosting.

### Key Directories

- `src/app/`: Contains Next.js routes and layouts.
- `src/modules/`: Modularized features (e.g., `videos`, `subscriptions`).
- `src/components/`: Reusable UI components.
- `src/db/`: Database schema and Drizzle ORM setup.
- `src/trpc/`: TRPC client and server setup.

## Developer Workflows

### Running the Project

- Use `bun dev` to start the development server.
- Access the app at `http://localhost:3000`.

### Database Migrations

- Use `bunx drizzle-kit push` to apply migrations.

### Testing

- No specific testing framework is enforced yet. Follow the project structure for adding tests.

## Project-Specific Conventions

### Import Ordering

- Follow this order:
  1. External libraries (e.g., `react`, `next/link`).
  2. UI components (e.g., `@/components/ui/button`).
  3. Local modules (e.g., `@/modules/videos`).
  4. Utilities (e.g., `@/lib/utils`).

### UI Components

- Always use Shadcn UI components for buttons, modals, etc.
- Avoid inline styles; use Tailwind CSS classes.

### Code Style

- Strictly type all props and functions.
- Avoid leaving comments unless explicitly requested.

## AI-Specific Coding Rules

### UI Components

- Always use the Shadcn UI `Button` component for all buttons, including icon buttons and menu triggers. Do not use native `<button>` unless absolutely necessary.
- For dropdowns, menus, and other interactive elements, use the Shadcn UI components provided in the `/components/ui/` directory.

### Importing Components

- When creating a new component, separate imports into three sections:
  1. External libraries (e.g., `react`, `next/link`)
  2. Local UI components (e.g., Shadcn UI)
  3. Local project files

### Comments

- Don't leave comments in code unless you are explicitly asked to do so.

### General

- Follow the project's established component and utility patterns.
- Do not use the `??` fallback for optional string props unless the UI requires it for correct display.
- Do not use the `?? ''` fallback for optional string props unless the UI requires it for correct display.

### How to Update

- Add any new AI-specific coding rules or preferences here to keep instructions clear and discoverable.

## Integration Points

- **TRPC**: Define procedures in `src/trpc/routers/` and use `trpc` hooks for client-side calls.
- **UploadThing**: Use `src/utils/uploadthing.ts` for upload logic.
- **Mux**: Video-related utilities are in `src/lib/mux.ts`.

## Examples

### Adding a New Module

1. Create a folder in `src/modules/`.
2. Add `layout.tsx` and `page.tsx` for the module.
3. Define routes in `src/app/`.

### Creating a TRPC Procedure

1. Add a router in `src/trpc/routers/`.
2. Export the router in `src/trpc/server.tsx`.
3. Use `trpc.<router>.<procedure>` on the client.

---

For any unclear or incomplete sections, please provide feedback to improve this document!
