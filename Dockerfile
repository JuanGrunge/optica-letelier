# syntax=docker/dockerfile:1

# --- Build stage ---
FROM node:18.20-alpine AS web
WORKDIR /web
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend ./
# Copia los assets estáticos existentes (CSS, imágenes, favicon) al public/ de Vite
COPY src/main/resources/static/assets ./public/assets
# Build Vue into /web/dist to avoid depending on Maven plugin inside Docker
ENV VITE_OUTDIR=/web/dist
RUN npm run build

FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -DskipTests dependency:go-offline

COPY src ./src
# Copy prebuilt frontend assets into Spring static directory
COPY --from=web /web/dist/ ./src/main/resources/static/
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -Dskip-frontend=true -DskipTests package

# --- Run stage ---
FROM eclipse-temurin:21-jre AS run
ENV JAVA_TOOL_OPTIONS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
WORKDIR /app

COPY --from=build /workspace/target/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

