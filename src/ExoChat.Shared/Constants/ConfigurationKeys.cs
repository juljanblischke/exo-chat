namespace ExoChat.Shared.Constants;

public static class ConfigurationKeys
{
    public const string DatabaseConnection = "ConnectionStrings:DefaultConnection";
    public const string RedisConnection = "ConnectionStrings:Redis";
    public const string KeycloakAuthority = "Keycloak:Authority";
    public const string KeycloakClientId = "Keycloak:ClientId";
    public const string MinioEndpoint = "MinIO:Endpoint";
    public const string RabbitMqHost = "RabbitMQ:Host";
}
