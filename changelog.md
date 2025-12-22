# Changelog

All notable changes to this project will be documented in this file.

The format is based on Semantic Versioning (MAJOR.MINOR.PATCH).

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
