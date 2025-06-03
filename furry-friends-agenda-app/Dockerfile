# Frontend Dockerfile

# ---- Builder Stage ----
FROM node:20-slim AS builder

WORKDIR /app

# Argument for API base URL, to be passed during Docker build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies using npm ci for consistency
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the React application
# The VITE_API_BASE_URL environment variable will be used by Vite during the build
RUN npm run build

# ---- Runner Stage ----
FROM nginx:stable-alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output from the builder stage to Nginx's webroot
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 