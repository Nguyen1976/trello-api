FROM node:alpine3.18

WORKDIR /app

RUN apk add --no-cache wget

COPY package.json ./

RUN npm install

COPY . .

RUN wget https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem -O ./global-bundle.pem

EXPOSE 8017

CMD ["npm", "run", "dev"]