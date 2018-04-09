FROM node:argon
RUN mkdir /urlshortener
WORKDIR /urlshortener
COPY package.json /urlshortener
RUN npm install
COPY . /urlshortener
EXPOSE 8080
CMD ["npm", "start"]
