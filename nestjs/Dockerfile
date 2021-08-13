FROM node:latest

# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install

#bundle app sources
COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/main"]