# ExoChat — GDPR & NIS2 Compliance (Germany/EU)

## GDPR Requirements
1. **Right of Access (Art. 15)**: Users can export all their data (messages, files, profile) as JSON/ZIP
2. **Right to Erasure (Art. 17)**: Account deletion with configurable grace period, hard delete of all personal data
3. **Right to Data Portability (Art. 20)**: Data export in machine-readable format
4. **Consent Management (Art. 7)**: 
   - Cookie consent banner
   - Terms of Service acceptance tracking with timestamps
   - Privacy policy acceptance
   - Granular consent for optional features
5. **Data Minimization (Art. 5)**: Only collect what's necessary
6. **Purpose Limitation**: Clear documentation of why each piece of data is collected
7. **Storage Limitation**: Configurable message retention policies
8. **Encryption**: E2E encryption (Signal Protocol) + encryption at rest + TLS in transit
9. **Data Processing Records (Art. 30)**: Documentation of all data processing activities
10. **Privacy by Design (Art. 25)**: Built into architecture from the start

## NIS2 Requirements (applicable if hosting for organizations)
1. **Security Event Logging**: All authentication events, admin actions, data access
2. **Incident Reporting**: Tooling to generate breach reports (24h initial, 72h detailed)
3. **Risk Assessment**: Documentation of security measures
4. **Supply Chain Security**: Track and audit all dependencies
5. **Multi-Factor Authentication**: Supported via Keycloak 2FA
6. **Encryption**: E2E + at-rest + in-transit

## Implementation Plan
- **Data Export Endpoint**: `GET /api/v1/users/me/export` — generates ZIP with all user data
- **Account Deletion**: `DELETE /api/v1/users/me` — triggers grace period, then hard delete via background job
- **Audit Log Table**: All security-relevant events with timestamps, user ID, action, IP
- **Consent Tracking Table**: User consents with type, timestamp, version
- **Privacy Policy Version Tracking**: Force re-acceptance when policy changes
- **Cookie Banner**: Frontend component with granular controls
- **Retention Worker**: Background job that cleans up expired messages/files
- **No PII in Logs**: Structured logging with PII scrubbing

## Legal Notes
- **Impressum** required (German law) — must be accessible from every page
- **Datenschutzerklärung** (Privacy Policy) — must be in German for German users
- Server location matters: prefer EU-based hosting (German servers ideal)
- Keycloak and all services run self-hosted = data sovereignty maintained
