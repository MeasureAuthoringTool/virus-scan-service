FROM node:15
ENV PORT=5000
ENV CLAMAV_HOST=clamav
ENV CLAMAV_PORT=3310
WORKDIR /usr/src/app
RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x wait-for-it.sh
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci --only=production
RUN npm run-script build
COPY ./dist .
EXPOSE ${PORT}
CMD ["sh", "-c", "./wait-for-it.sh ${CLAMAV_HOST}:${CLAMAV_PORT} --strict --timeout=90 -- node src/main"]
