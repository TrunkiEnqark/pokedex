FROM node:14
WORKDIR /app
COPY formFeedback/package*.json ./
RUN npm install
COPY /formFeedback .
EXPOSE 3001
CMD ["node","run","dev"]