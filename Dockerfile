FROM node:16-bullseye-slim

# Default values for clamav
ENV CLAMAV_HOST=clamav
ENV CLAMAV_PORT=3310
ENV CLAMAV_TIMEOUT=120

WORKDIR /usr/src/app

RUN wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x wait-for-it.sh

# Install app dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci --only=production

# Bundle our app resources
COPY ./dist .

EXPOSE 5000
ENTRYPOINT ["sh", "-c", "./wait-for-it.sh ${CLAMAV_HOST}:${CLAMAV_PORT} --strict --timeout=${CLAMAV_TIMEOUT} -- node src/main"]
