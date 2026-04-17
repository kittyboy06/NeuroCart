# Build environment
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production environment
FROM nginx:alpine
# Copy the custom Nginx config to support client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the built app to Nginx's default public directory
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
