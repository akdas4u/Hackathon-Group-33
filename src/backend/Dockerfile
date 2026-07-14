# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder

WORKDIR /src

# Copy solution file and project files
COPY ReleaseReadiness.sln ./
COPY ReleaseReadiness.API/ReleaseReadiness.API.csproj ReleaseReadiness.API/
COPY ReleaseReadiness.Application/ReleaseReadiness.Application.csproj ReleaseReadiness.Application/
COPY ReleaseReadiness.Domain/ReleaseReadiness.Domain.csproj ReleaseReadiness.Domain/
COPY ReleaseReadiness.Infrastructure/ReleaseReadiness.Infrastructure.csproj ReleaseReadiness.Infrastructure/
COPY ReleaseReadiness.Tests/ReleaseReadiness.Tests.csproj ReleaseReadiness.Tests/
COPY global.json ./

# Restore dependencies
RUN dotnet restore ReleaseReadiness.sln

# Copy all source code
COPY . .

# Build the API
RUN dotnet publish -c Release -o /out ReleaseReadiness.API/ReleaseReadiness.API.csproj

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Copy published binaries from builder
COPY --from=builder /out .

# Expose port (ASP.NET Core default)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD dotnet --version || exit 1

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the API
ENTRYPOINT ["dotnet", "ReleaseReadiness.API.dll"]
