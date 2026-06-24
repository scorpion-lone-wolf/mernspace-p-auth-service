# 1. use offical Node.js LTS image
FROM node:lts-trixie

# 2. set working directory inside container
WORKDIR /usr/src/app

# 3. copy packages file first
COPY package*.json ./

# 4. install dependencies
RUN npm install

# 5. copy source code
COPY . .

# 6. expose port
EXPOSE 5501

# 7. run app
CMD ["npm" ,"run","dev"]
