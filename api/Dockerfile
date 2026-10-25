# syntax=docker/dockerfile:1

# ---- Build stage ------------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy only the project files first so NuGet restore is cached between builds.
COPY api/src/GymApi.Domain/GymApi.Domain.csproj src/GymApi.Domain/
COPY api/src/GymApi.Application/GymApi.Application.csproj src/GymApi.Application/
COPY api/src/GymApi.Infrastructure/GymApi.Infrastructure.csproj src/GymApi.Infrastructure/
COPY api/src/GymApi.Api/GymApi.Api.csproj src/GymApi.Api/
RUN dotnet restore src/GymApi.Api/GymApi.Api.csproj

# Copy the source and publish in Release mode.
COPY api/src/ src/
RUN dotnet publish src/GymApi.Api/GymApi.Api.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish \
    /p:UseAppHost=false

# ---- Runtime stage ----------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Development \
    DOTNET_RUNNING_IN_CONTAINER=true

EXPOSE 8080

ENTRYPOINT ["dotnet", "GymApi.Api.dll"]
