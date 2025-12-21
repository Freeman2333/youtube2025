- Do not leave comments in code unless I ask you directly.

- When creating or refactoring components, organize imports as follows:

  1. At the top, include imports from external libraries (e.g., React, Zod).
  2. Leave a blank line.
  3. Next, include imports from the `components/ui` folder for shadcn UI components.
  4. Leave another blank line.
  5. Finally, include imports from other local components, utility files, etc.
  6. Always use absolute imports (e.g., `@/path/to/file`) instead of relative imports (e.g., `../../file`).

- Change Logging Requirements:
  1. Maintain a repository-wide `changelog.md` at the project root.
  2. Each time code is generated or files are edited, append a new entry following Semantic Versioning (MAJOR.MINOR.PATCH).
  3. Include the ISO date (YYYY-MM-DD), version, and a concise description of changes.
  4. Group entries under version headers and use short bullet points for modifications.
  5. Only include user-visible or repository-impacting changes; skip trivial whitespace-only edits.
