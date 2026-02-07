# ExoChat — Architecture

## Clean Architecture (Modular Monolith)

```
exo-chat/
├── src/
│   ├── ExoChat.Domain/            # Layer 1: Entities, Value Objects, Enums, Domain Events
│   ├── ExoChat.Application/       # Layer 2: Use Cases (CQRS), DTOs, Interfaces, Validators
│   ├── ExoChat.Infrastructure/    # Layer 3: EF Core, SignalR, Email, Storage, Redis, RabbitMQ
│   ├── ExoChat.Api/               # Layer 4: Controllers, Hubs, Middleware, Program.cs
│   └── ExoChat.Shared/            # Cross-cutting: Exceptions, Constants, Extensions
│
├── web/                           # Next.js frontend (separate app, pnpm)
│   ├── src/
│   │   ├── app/                   # App Router pages
│   │   ├── components/            # shadcn/ui + custom components
│   │   ├── lib/                   # API client, SignalR client, auth helpers
│   │   ├── hooks/                 # Custom React hooks
│   │   └── stores/                # Zustand state management
│   └── package.json
│
├── tests/
│   ├── ExoChat.UnitTests/
│   └── ExoChat.IntegrationTests/
│
├── docker/
│   ├── docker-compose.yml         # All 8 services
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── .github/
│   ├── workflows/                 # CI/CD
│   └── ISSUE_TEMPLATE/
│
└── docs/
```

## Dependency Flow (Clean Architecture)
```
Domain ← Application ← Infrastructure
                     ← Api (also references Infrastructure for DI)
Shared is referenced by Application, Infrastructure, Api
Domain has NO dependencies on other projects
```

## Project References
- ExoChat.Application → ExoChat.Domain, ExoChat.Shared
- ExoChat.Infrastructure → ExoChat.Application, ExoChat.Domain, ExoChat.Shared
- ExoChat.Api → ExoChat.Application, ExoChat.Infrastructure, ExoChat.Shared

## Key Patterns
- **CQRS** via MediatR (Commands/Queries separated)
- **Repository Pattern** abstracted in Application, implemented in Infrastructure
- **Unit of Work** via EF Core DbContext
- **Domain Events** for cross-aggregate communication
- **Auto-Migration** in Program.cs (EF Core `context.Database.Migrate()`)
- **API Versioning** via `/api/v1/` prefix
- **Consistent API response envelope** for all endpoints

## Auth Flow
```
User → Next.js → Keycloak (login/register/2FA/verify email)
                    ↓ JWT
              ASP.NET API (validates JWT via OIDC middleware)
```
Backend only validates tokens. All auth logic lives in Keycloak.

## Real-time Architecture
```
Frontend ←→ SignalR Hub ←→ Application Layer ←→ Domain
                         ←→ Redis (backplane for scaling)
                         ←→ RabbitMQ (async events)
```

## File Storage
```
Upload → API validates → ImageSharp processes (thumbnail) → MinIO stores → URL returned
```

## Calling Architecture
```
Call initiated → API creates LiveKit room → Generates participant tokens
              → SignalR notifies callee (ring)
              → Both connect to LiveKit via WebRTC
              → SignalR handles signaling (accept/reject/end)
```
