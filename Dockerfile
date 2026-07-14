FROM node:20-alpine
WORKDIR /app
COPY . .
RUN cd user && npm install && npm run build
RUN cd admin/frontend && npm install && npm run build
RUN cd admin/backend && npm install
EXPOSE 5000
CMD ["node", "admin/backend/server.js"]
