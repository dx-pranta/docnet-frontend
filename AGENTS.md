# DocNet Frontend - Agent Instructions

This document provides comprehensive guidelines for AI agents working on the DocNet frontend codebase. Follow these instructions to maintain code quality, consistency, and project standards.

## Project Overview

DocNet is a React + TypeScript + Tailwind CSS frontend application for a professional networking platform targeted at healthcare professionals. It uses modern React patterns with functional components, hooks, and state management.

## Build System & Commands

### Development
```bash
npm run dev          # Start Vite dev server on port 5173 with API proxy to localhost:5001
```

### Build & Type Checking
```bash
npm run build        # TypeScript compilation + Vite production build
npm run preview      # Preview production build locally
```

### Code Quality (When Available)
```bash
# Note: No lint/test scripts currently configured
# Recommended additions:
npm run lint         # ESLint (when configured)
npm run test         # Run test suite (when configured)
npm run test:watch   # Run tests in watch mode
npm run typecheck    # TypeScript type checking only
```

### Testing Individual Components
```bash
# For future test setup with Vitest/Jest:
npm run test -- src/components/ComponentName.test.tsx
npm run test -- src/pages/PageName.test.tsx
npm run test -- src/services/serviceName.test.ts
```

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode enabled**: All TypeScript strict checks are active
- **Target**: ES2020 with modern JavaScript features
- **JSX**: React JSX transform (`react-jsx`)
- **Module resolution**: Bundler resolution for optimal tree-shaking
- **Unused detection**: `noUnusedLocals` and `noUnusedParameters` enabled

### Import Organization
Group imports in this order with blank lines between groups:
1. React imports
2. Third-party library imports (alphabetically)
3. Local imports (relative paths)

```typescript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaIcon } from 'react-icons/fa';

import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
```

### Component Structure
- Use functional components with hooks
- Prefer named exports over default exports
- Use arrow function syntax for components
- Props should be typed with interfaces

```typescript
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: ComponentProps) {
  // Component logic
}
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile`, `EventCard`)
- **Functions/Variables**: camelCase (`handleSubmit`, `userData`)
- **Interfaces/Types**: PascalCase with descriptive names (`UserProfile`, `ApiResponse`)
- **Files**: PascalCase for components, camelCase for utilities (`UserProfile.tsx`, `apiClient.ts`)
- **Directories**: lowercase (`components`, `services`, `pages`)

### State Management (Zustand)
- Use Zustand stores for global state
- Prefer persist middleware for auth/user data
- Keep stores focused on specific domains

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
}
```

### Data Fetching (React Query)
- Use `@tanstack/react-query` for server state
- Define query keys as arrays for proper caching
- Handle loading/error states appropriately

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['events', 'upcoming'],
  queryFn: () => eventService.getEvents({ status: 'upcoming' }),
});
```

### API Services
- Centralized API calls in `services/api.ts`
- Use axios interceptors for auth headers and error handling
- Group related endpoints in service objects

```typescript
export const eventService = {
  getEvents: (params?: EventFilters) => api.get('/events', { params }),
  createEvent: (data: CreateEventData) => api.post('/events', data),
  // ... other methods
};
```

### Error Handling
- API errors are handled globally via axios interceptors
- 401 responses automatically trigger logout
- Use try/catch for specific error scenarios
- Display user-friendly error messages with toast notifications

### Forms (React Hook Form + Zod)
- Use `react-hook-form` for form state management
- Validate with Zod schemas
- Use `@hookform/resolvers/zod` for integration

```typescript
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
}
```

## Styling Guidelines

### Tailwind CSS
- Use utility-first approach with Tailwind classes
- Extend theme with custom colors in `tailwind.config.js`
- Create reusable component classes in `index.css`

### Custom CSS Classes
Define reusable classes for common patterns:

```css
.btn-primary {
  @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium;
}

.card {
  @apply bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden;
}

.input-field {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all;
}
```

### Color Palette
Primary brand colors defined in Tailwind config:
- `primary-50` through `primary-900` (blue spectrum)
- Use semantic color naming (`primary`, `secondary`, `success`, `error`)

### Responsive Design
- Mobile-first approach with `md:`, `lg:` breakpoints
- Use grid layouts for responsive cards: `grid md:grid-cols-2 lg:grid-cols-3`

## File Structure

```
src/
├── components/          # Reusable UI components
│   └── layout/         # Layout components (Layout, Header, etc.)
├── pages/              # Route components (Dashboard, Events, etc.)
├── services/           # API service functions
├── store/              # Zustand stores (authStore, etc.)
├── App.tsx             # Main app component with routing
├── main.tsx            # App entry point
└── index.css           # Global styles and Tailwind imports
```

## Security Considerations

- Never log or expose authentication tokens
- Use environment variables for sensitive configuration
- Validate all user inputs on both client and server
- Implement proper error boundaries for production

## Performance Best Practices

- Use React.memo for expensive components
- Implement proper loading states to prevent layout shift
- Optimize images and assets
- Use React Query's caching for efficient data fetching
- Avoid unnecessary re-renders with proper dependency arrays

## Development Workflow

1. **Start development**: `npm run dev`
2. **Make changes**: Edit files following the style guidelines
3. **Type checking**: `npm run build` to verify TypeScript compilation
4. **Test changes**: Manual testing in browser + dev tools
5. **Code review**: Ensure all guidelines are followed before committing

## Common Patterns

### Private Routes
```typescript
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}
```

### Data Loading with Error States
```typescript
if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading data</div>;
return <div>{/* Render data */}</div>;
```

### Form Submission
```typescript
const onSubmit = async (data: FormData) => {
  try {
    await apiCall(data);
    toast.success('Success!');
    navigate('/success');
  } catch (error) {
    toast.error('Something went wrong');
  }
};
```

Follow these guidelines to maintain consistency and quality across the DocNet frontend codebase.</content>
<parameter name="filePath">/Users/debasish/docnet-frontend/AGENTS.md