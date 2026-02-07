# ExoChat — Task Completion Checklist

When a development task is completed, perform these steps:

## Before Committing
1. **Build**: `dotnet build ExoChat.sln` — must compile without errors
2. **Format**: `dotnet format` — auto-fix formatting issues
3. **Lint frontend**: `cd web && pnpm lint` — if frontend files were changed
4. **Run tests**: `dotnet test` — all tests must pass
5. **No secrets**: Ensure no credentials, API keys, or secrets are in code

## Commit
- Use conventional commit messages: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- Reference the GitHub issue: `feat: add user entity (#12)`

## PR
- Title: short, descriptive
- Body: reference the issue, describe what changed and why
- Label: appropriate phase + area labels
- Request review if needed

## GDPR Check (if applicable)
- New data stored? Update data processing documentation
- Personal data? Ensure it's included in data export
- New logging? No PII in logs
- New cookies? Update consent management
