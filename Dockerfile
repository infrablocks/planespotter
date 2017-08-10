FROM node:8.2.1

WORKDIR /opt/cconccourse
ADD package.json /opt/cconccourse/package.json
ADD src/app.js /opt/cconccourse/app.js
RUN npm install


EXPOSE 3000
CMD ["node", "/opt/cconccourse/app.js"]