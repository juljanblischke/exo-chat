# ExoChat — Suggested Commands

## System (Windows)
- `dir` or `ls` (Git Bash) — list directory
- `git` — version control
- `where` — find executables (like `which` on Linux)

## .NET Backend
```bash
# Build entire solution
dotnet build ExoChat.sln

# Run API (with hot reload)
dotnet watch run --project src/ExoChat.Api

# Run API (without hot reload)
dotnet run --project src/ExoChat.Api

# Run unit tests
dotnet test tests/ExoChat.UnitTests

# Run integration tests
dotnet test tests/ExoChat.IntegrationTests

# Run all tests
dotnet test

# Add EF Core migration
dotnet ef migrations add <MigrationName> --project src/ExoChat.Infrastructure --startup-project src/ExoChat.Api

# Update database manually (auto-migration runs on startup)
dotnet ef database update --project src/ExoChat.Infrastructure --startup-project src/ExoChat.Api

# Format code
dotnet format
```

## Frontend (Next.js)
```bash
# Install dependencies
cd web && pnpm install

# Dev server
cd web && pnpm dev

# Build
cd web && pnpm build

# Lint
cd web && pnpm lint

# Add shadcn/ui component
cd web && pnpm dlx shadcn@latest add <component>
```

## Docker
```bash
# Start all infrastructure services
docker compose -f docker/docker-compose.yml up -d

# Stop all services
docker compose -f docker/docker-compose.yml down

# View logs
docker compose -f docker/docker-compose.yml logs -f <service>

# Reset volumes (fresh start)
docker compose -f docker/docker-compose.yml down -v
```

## GitHub
```bash
# Create issue
gh issue create --title "..." --body "..." --label "..."

# Create PR
gh pr create --title "..." --body "..."

# View issues
gh issue list
```

## Service Admin UIs (when docker-compose is running)
- Keycloak Admin: http://localhost:8080 (admin/admin_dev)
- RabbitMQ Management: http://localhost:15672 (exochat/exochat_dev)
- MinIO Console: http://localhost:9001 (exochat/exochat_dev_password)
- Mailpit UI: http://localhost:8025
- API Swagger: http://localhost:5000/swagger (once configured)
