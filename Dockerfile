FROM node:8.2.1

WORKDIR /opt/planespotter
ADD package.json /opt/planespotter/package.json
RUN npm install

ADD src/app.js /opt/planespotter/app.js

EXPOSE 3000
CMD ["node", "/opt/planespotter/app.js"]