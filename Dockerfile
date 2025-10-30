# --- Build Stage ---
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    RUN npm install -g pnpm
    
    COPY pnpm-lock.yaml pnpm-workspace.yaml* package.json ./
    COPY . .
    
    # ADD THIS LINE:
    ENV CI=true
    
    RUN pnpm install --frozen-lockfile
    RUN pnpm build
    
    # --- Production Stage ---
    FROM nginx:alpine
    
    COPY --from=builder /app/dist /usr/share/nginx/html
    COPY ./nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]