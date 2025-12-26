# Changelog

All notable changes to this project will be documented in this file.

The format is based on Semantic Versioning (MAJOR.MINOR.PATCH).

## [0.1.12] - 2025-12-26

### Fixed

- Resolved hydration error in AuthButton component by adding client-side mount check
- Added loading placeholder for Clerk UserButton to prevent SSR/client mismatch

## [0.1.11] - 2025-12-26

### Added

- Created `CommentReactions` component with thumbs up/down UI (no background styling)
- Added like/dislike counts and viewer reaction state support
- Implemented `commentReactionsRouter` with like/dislike mutations
- Added comment reaction database schema with foreign key relations
- Integrated comment reactions with infinite query optimistic updates
- Added viewer reaction CTE to comments getMany procedure for current user reactions

### Changed

- Renamed `Reactions` component to `VideoReactions` for better clarity and distinction from comment reactions
- Renamed `reactions.tsx` file to `video-reactions.tsx`
- Updated import and usage in video-top-row component
- Moved comment reactions procedure to `comment-reactions/server/procedure.ts`
- Moved comment reactions component to `comment-reactions/ui/components/comment-reactions.tsx`
- Updated imports across modules to reflect new file organization

## [0.1.10] - 2025-12-23

### Added

- Added comments table to database schema with basic fields (id, content, userId, videoId, createdAt, updatedAt)
- Created comments module with TRPC procedures for create and getMany operations
- Integrated comments router into the main TRPC app router

## [0.1.9] - 2025-12-23

### Changed

- Refactored VideosSectionSkeleton to use VideoPlayerSkeleton, VideoTopRowSkeleton, and a custom VideoBanner skeleton, matching the exact component order and layout of the VideoSectionSuspense component.

## [0.1.8] - 2025-12-23

### Added

- Added VideoTopRowSkeleton component for loading states, matching the exact layout and sizes of the VideoTopRow component including title, video owner info, reactions, menu, and description sections.

## [0.1.7] - 2025-12-23

### Added

- Added VideoPlayerSkeleton component for loading states, matching the exact dimensions and styling of the VideoPlayer component.

## [0.1.6] - 2025-12-22

### Added

- Added optimistic updates to useSubscription hook for immediate UI feedback on subscribe/unsubscribe actions with automatic rollback on error.

## [0.1.5] - 2025-12-22

### Added

- Added isPending flag to useSubscription hook to indicate loading state during subscribe/unsubscribe mutations. Updated VideoOwner component to disable the button during pending state.

## [0.1.4] - 2025-12-22

### Changed

- Moved authentication check logic into the useSubscription hook for better encapsulation. Updated VideoOwner component accordingly.

## [0.1.3] - 2025-12-22

### Changed

- Optimized subscribe and unsubscribe procedures to use ctx.user.id from middleware instead of additional DB query. Removed unused imports.

## [0.1.2] - 2025-12-22

### Added

- Created reusable `useSubscription` hook in subscriptions module to handle subscribe/unsubscribe logic. Updated VideoOwner component to use the hook.

## [0.1.1] - 2025-12-22

### Added

- Updated VideoOwner component to handle both subscribe and unsubscribe mutations based on subscription status.

## [0.1.0] - 2025-12-22

### Added

- Added `unsubscribe` procedure to `subscriptionsRouter` for handling user unsubscriptions.

## [0.0.1] - 2025-12-20

### Added

- Introduced change logging guidelines in `.github/copilot-instructions.md`.
- Created initial `changelog.md` file to track future changes.
