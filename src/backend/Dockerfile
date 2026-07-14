# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first to leverage Docker layer caching
COPY ReleaseReadiness.sln ./
COPY ReleaseReadiness.API/ReleaseReadiness.API.csproj ReleaseReadiness.API/
COPY ReleaseReadiness.Application/ReleaseReadiness.Application.csproj ReleaseReadiness.Application/
COPY ReleaseReadiness.Domain/ReleaseReadiness.Domain.csproj ReleaseReadiness.Domain/
COPY ReleaseReadiness.Infrastructure/ReleaseReadiness.Infrastructure.csproj ReleaseReadiness.Infrastructure/
COPY ReleaseReadiness.Tests/ReleaseReadiness.Tests.csproj ReleaseReadiness.Tests/

RUN dotnet restore ReleaseReadiness.sln

# Copy the remaining source code
COPY . .

# Publish the API project in Release mode
RUN dotnet publish ReleaseReadiness.API/ReleaseReadiness.API.csproj \
    -c Release \
    -o /out \
    --no-restore

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# curl is required for the HEALTHCHECK directive below
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy published output from the build stage
COPY --from=build /out .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health/live || exit 1

ENTRYPOINT ["dotnet", "ReleaseReadiness.API.dll"]
