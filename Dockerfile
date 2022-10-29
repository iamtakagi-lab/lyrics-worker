FROM node:18-alpine as base

# Install Dependencies
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      tzdata

RUN apk add --no-cache curl fontconfig \
  && curl -O https://noto-website.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip \
  && mkdir -p /usr/share/fonts/NotoSansCJKjp \
  && unzip NotoSansCJKjp-hinted.zip -d /usr/share/fonts/NotoSansCJKjp/ \
  && rm NotoSansCJKjp-hinted.zip \
  && fc-cache -fv

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

ENV TZ Asia/Tokyo

# Build App
ENV NODE_ENV production

WORKDIR /app/lyrics

COPY package.json yarn.lock ./
RUN yarn install --immutable 
COPY tsconfig.json ./
COPY src ./src

FROM base as builder

RUN yarn global add typescript
RUN yarn build

FROM base

COPY --from=builder /app/lyrics/dist ./dist

# Add Crontab
ADD crontab /var/spool/crontab/root
RUN crontab /var/spool/crontab/root

ENTRYPOINT ["crond", "-f"]