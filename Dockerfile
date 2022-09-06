FROM node:slim


ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

CMD [ "node", "app.js" ]