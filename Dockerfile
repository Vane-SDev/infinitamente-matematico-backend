# Dockerfile para el Backend
FROM node:18

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto del backend
EXPOSE 3000

# Comando para ejecutar el backend
CMD ["npm", "start"]
