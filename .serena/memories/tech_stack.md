# ExoChat — Tech Stack

## Backend
- **Runtime**: .NET 8, ASP.NET Core, C#
- **Architecture**: Modular Monolith, Clean Architecture
- **ORM**: Entity Framework Core with auto-migration in Program.cs
- **CQRS**: MediatR
- **Validation**: FluentValidation
- **Real-time**: SignalR
- **API Style**: RESTful with OpenAPI/Swagger, API versioning (`/api/v1/`)

## Frontend
- **Framework**: Next.js 16 (App Router), TypeScript
- **Package Manager**: pnpm
- **UI Library**: shadcn/ui + Radix UI + Tailwind CSS v4
- **State Management**: Zustand
- **Real-time Client**: @microsoft/signalr
- **Auth Client**: next-auth with Keycloak provider

## Infrastructure Services (all Docker containers)
| Service | Image | Purpose | Ports |
|---------|-------|---------|-------|
| PostgreSQL 16 | postgres:16-alpine | Main database | 5432 |
| Redis 7 | redis:7-alpine | Cache + pub/sub | 6379 |
| RabbitMQ 3 | rabbitmq:3-management-alpine | Message broker | 5672, 15672 (mgmt) |
| Keycloak | quay.io/keycloak/keycloak:latest | Authentication (OIDC) | 8080 |
| MinIO | minio/minio:latest | File/image storage (S3-compatible) | 9000, 9001 (console) |
| LiveKit | livekit/livekit-server:latest | Voice & video calls (WebRTC) | 7880, 7881, 7882/udp |
| Mailpit | axllent/mailpit:latest | Dev email catching | 1025 (SMTP), 8025 (UI) |

## CI/CD
- GitHub Actions

## Containerization
- Docker + Docker Compose
- Dockerfile.api (multi-stage .NET build)
- Dockerfile.web (Next.js standalone output)
