FROM node:latest as node
WORKDIR /app/rpsFrontend
COPY . .
WORKDIR /app/rpsFrontend/rpsChat
RUN npm i
RUN npm install -g @angular/cli
EXPOSE 4200
CMD ng serve --host 0.0.0.0
