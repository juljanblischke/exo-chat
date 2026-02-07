# ExoChat — Agent Teams & Parallel Work Strategy

## Team Structure

Teams are created per-phase. Each team maps to GitHub issues and PRs.
Agent Teams can use `subagent_type: "general-purpose"` for implementation work.

### Phase 1: Foundation (ALL PARALLEL)

**Team A: "backend-foundation"**
- Set up Clean Architecture project references (DONE)
- Domain entities: User, Conversation, Message, Group, etc.
- EF Core DbContext, auto-migration in Program.cs
- Base repository interfaces + implementations
- MediatR + FluentValidation setup
- Swagger/OpenAPI configuration
- Health check endpoints
- GitHub Issues: #1-#8 approx

**Team B: "frontend-foundation"**
- shadcn/ui installation + theming (dark/light)
- Layout: sidebar, chat area, header
- Routing: /login, /register, /chat, /settings
- Zustand store setup
- API client setup (axios/fetch wrapper)
- SignalR client setup
- GitHub Issues: #9-#14 approx

**Team C: "infra-foundation"**
- Docker Compose (DONE)
- Dockerfiles for API and Web
- GitHub Actions CI (build + test on PR)
- GitHub issue templates, labels, branch protection
- .editorconfig
- GitHub Issues: #15-#19 approx

### Phase 2: Authentication (PARALLEL — depends on Phase 1)

**Team D: "backend-auth"**
- Keycloak realm configuration (exochat realm, client)
- .NET OIDC/JWT middleware configuration
- User sync: Keycloak → local DB (on first login)
- Auth-required endpoints, role-based access
- GitHub Issues: #20-#24 approx

**Team E: "frontend-auth"**
- next-auth setup with Keycloak provider
- Login page
- Register page (redirects to Keycloak)
- Email verification flow
- Protected routes (middleware)
- User profile page
- GitHub Issues: #25-#30 approx

### Phase 3: Chat Core (PARALLEL — depends on Phase 2)

**Team F: "backend-chat"**
- Conversation domain (create, list, get)
- Message domain (send, receive, edit, delete)
- Group management (create, invite, leave, roles)
- SignalR ChatHub (send message, join group, typing, online status)
- Redis backplane for SignalR
- RabbitMQ for async events (notifications, etc.)
- GitHub Issues: #31-#40 approx

**Team G: "frontend-chat"**
- Conversation list sidebar
- Chat message area (bubbles, timestamps, sender info)
- Message input (text, emoji picker)
- Group creation/management UI
- Real-time updates via SignalR client
- GitHub Issues: #41-#48 approx

**Team H: "backend-files"**
- MinIO client setup
- File upload endpoint (with validation, size limits)
- Image processing (thumbnails via ImageSharp)
- File download endpoint (signed URLs)
- File message type in chat
- GitHub Issues: #49-#53 approx

### Phase 4: Calling (PARALLEL with Phase 5 — depends on Phase 3)

**Team I: "calling"**
- LiveKit server SDK integration (.NET)
- Room management (create, token generation)
- Call signaling via SignalR (ring, accept, reject, end)
- Frontend: call UI using LiveKit React SDK
- 1-on-1 and group calls
- Screen sharing
- GitHub Issues: #54-#60 approx

### Phase 5: Advanced Features (PARALLEL with Phase 4 — depends on Phase 3)

**Team J: "encryption"**
- Signal Protocol key management (backend)
- Key exchange (X3DH) implementation
- Double Ratchet for message encryption
- Frontend: encrypt/decrypt messages client-side
- Device key management
- GitHub Issues: #61-#66 approx

**Team K: "gdpr-compliance"**
- Data export endpoint (JSON/ZIP)
- Account deletion with grace period + background job
- Audit logging table + middleware
- Consent management (backend + frontend cookie banner)
- Impressum + Datenschutzerklärung pages
- Retention worker (configurable message cleanup)
- GitHub Issues: #67-#74 approx

**Team L: "features-polish"**
- Typing indicators (SignalR)
- Read receipts
- Online/offline status
- Message search
- Notification system
- Settings page
- GitHub Issues: #75-#82 approx

## Parallelization Summary
```
Time →
Phase 1: [A: backend-foundation] [B: frontend-foundation] [C: infra-foundation]
          ↓                       ↓
Phase 2:  [D: backend-auth]       [E: frontend-auth]
           ↓                       ↓
Phase 3:   [F: backend-chat] [G: frontend-chat] [H: backend-files]
            ↓                 ↓
Phase 4+5:  [I: calling] [J: encryption] [K: gdpr] [L: polish]
```

## How to spawn a team
```
Use TeamCreate with team_name like "phase1-foundation"
Then spawn Task agents with subagent_type: "general-purpose" and team_name
Assign issues via TaskCreate, coordinate via SendMessage
```
