# Multi-stage build for backend
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
# Create required directories
RUN mkdir uploads output

EXPOSE 8081
ENV PORT=8081
CMD ["node", "dist/index.js"]
