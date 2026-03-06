## Packages
date-fns | Formatting timestamps for changelog and list views
framer-motion | Page transitions and UI animations

## Notes
The application requires API endpoints for `/api/accounts`, `/api/accounts/:id`, `/api/accounts/:id/process-demo`, and `/api/accounts/:id/process-onboarding` as defined in `shared/routes.ts`.
Changelog parsing assumes the `changes` payload is either an array of strings or objects.
