FROM node:8.2.1

WORKDIR               /opt/planespotter

ADD package.json      /opt/planespotter/package.json
ADD package-lock.json /opt/planespotter/package-lock.json
RUN npm install --only=production

ADD src/             /opt/planespotter/

EXPOSE 3000
CMD ["node", "/opt/planespotter/app.js"]