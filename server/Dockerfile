FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci --omit=dev --workspace server
COPY server/src ./server/src
EXPOSE 4000
CMD ["npm", "start", "--workspace", "server"]
