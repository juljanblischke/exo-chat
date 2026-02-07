using ExoChat.Application.Common.Interfaces;
using ExoChat.Infrastructure.Options;
using ExoChat.Infrastructure.Persistence;
using ExoChat.Infrastructure.Persistence.Repositories;
using ExoChat.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ExoChat.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ExoChatDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IParticipantRepository, ParticipantRepository>();

        // MinIO file storage
        services.Configure<MinioOptions>(configuration.GetSection(MinioOptions.SectionName));
        services.AddSingleton<MinioFileStorageService>();
        services.AddSingleton<IFileStorageService>(sp => sp.GetRequiredService<MinioFileStorageService>());
        services.AddSingleton<IThumbnailService, ImageSharpThumbnailService>();
        services.AddHostedService<MinioBucketInitializer>();

        // LiveKit call service
        services.Configure<LiveKitOptions>(configuration.GetSection(LiveKitOptions.SectionName));
        services.AddSingleton<ICallService, LiveKitCallService>();

        return services;
    }
}
