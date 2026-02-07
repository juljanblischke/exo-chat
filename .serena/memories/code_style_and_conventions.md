# ExoChat — Code Style & Conventions

## C# Backend
- **Naming**: PascalCase for classes, methods, properties. camelCase for local variables, parameters. _camelCase for private fields.
- **Async**: All I/O-bound methods must be async with `Async` suffix (e.g., `GetUserAsync`)
- **Nullable**: Nullable reference types enabled project-wide
- **File-scoped namespaces**: Use `namespace ExoChat.Domain.Entities;` (not block-scoped)
- **Primary constructors**: Prefer where appropriate (.NET 8+)
- **Records**: Use records for DTOs and value objects
- **CQRS naming**: `CreateMessageCommand`, `GetConversationQuery`, `CreateMessageCommandHandler`
- **No regions**: Don't use `#region`
- **Formatting**: `dotnet format` for consistency
- **XML docs**: Only for public API surface and complex logic

## TypeScript Frontend
- **Strict mode**: enabled
- **Naming**: camelCase for variables/functions, PascalCase for components/types/interfaces
- **Components**: Function components only, no class components
- **Imports**: Use `@/*` alias for src imports
- **State**: Zustand stores in `src/stores/`
- **API calls**: Centralized in `src/lib/api/`
- **No `any`**: Use proper types always
- **Formatting**: ESLint + Prettier

## Git Conventions
- **Branch naming**: `feature/<issue-number>-short-description`, `fix/<issue-number>-short-description`
- **Commit messages**: Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **PRs**: One PR per issue, reference issue in PR body
- **Labels**: `phase-1`, `phase-2`, etc. + `backend`, `frontend`, `infra`, `auth`, `chat`, `calling`, `encryption`, `gdpr`

## Project Patterns
- **No business logic in controllers** — controllers only delegate to MediatR
- **Validation in Application layer** via FluentValidation
- **Domain entities are rich** — behavior lives on entities, not in services
- **Infrastructure is swappable** — all external dependencies behind interfaces defined in Application
