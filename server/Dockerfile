FROM node:24-alpine
WORKDIR /app
COPY package.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm install --omit=dev --workspace server
COPY server/src ./server/src
EXPOSE 4000
CMD ["npm", "start", "--workspace", "server"]
