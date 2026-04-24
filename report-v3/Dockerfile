FROM jsreport/jsreport:4.12.0-full

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY server.js jsreport.config.json ./
COPY data ./data

EXPOSE 5488
CMD ["npm", "start"]
