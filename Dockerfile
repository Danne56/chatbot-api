# Base Stage
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development Stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Production Stage
FROM base AS production
RUN npm install --omit=dev
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
