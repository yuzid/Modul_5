# Root Dockerfile untuk membangun frontend dan backend menjadi satu container

# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend-portal/package.json frontend-portal/package-lock.json ./
RUN npm install
COPY frontend-portal/ ./
RUN npm run build

# Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend-portal/package.json backend-portal/package-lock.json ./
RUN npm install
COPY backend-portal/ ./
RUN npm run build

# Runtime image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package.json ./package.json
COPY --from=backend-builder /app/backend/package-lock.json ./package-lock.json
COPY --from=frontend-builder /app/frontend/build ./frontend-build
RUN npm install --production
EXPOSE 5000
CMD ["node", "dist/server.js"]
