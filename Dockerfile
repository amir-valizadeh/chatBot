FROM node:20-alpine as build

WORKDIR /app

ARG VITE_API_BASE_URL=http://hurosh.pegaheaftab.com/backend
ARG VITE_COMPANY_NAME=pegah

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_COMPANY_NAME=$VITE_COMPANY_NAME

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]