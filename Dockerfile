# Use Node.js as the base image
FROM node:18 AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Use Nginx to serve the built files
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app to Nginx
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 3333

CMD ["nginx", "-g", "daemon off;"]
