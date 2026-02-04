# Step 1: Build React app
FROM node:18 AS build
WORKDIR /app
COPY ../react-app/package*.json ./
RUN npm install
COPY ../react-app ./
RUN npm run build

# Step 2: Serve React build using Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
