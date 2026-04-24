FROM jsreport/jsreport:4.12.0-full

USER root
WORKDIR /app
RUN chown -R jsreport:jsreport /app
USER jsreport

COPY --chown=jsreport:jsreport package*.json ./
RUN npm ci --omit=dev

COPY --chown=jsreport:jsreport server.js jsreport.config.json ./
COPY --chown=jsreport:jsreport data ./data

EXPOSE 5488
CMD ["npm", "start"]
