FROM node:24.2.0

WORKDIR               /opt/planespotter

ADD package.json      /opt/planespotter/package.json
ADD package-lock.json /opt/planespotter/package-lock.json
RUN npm install --only=production

ADD src             /opt/planespotter/src

EXPOSE 3000
CMD ["npm", "start"]
