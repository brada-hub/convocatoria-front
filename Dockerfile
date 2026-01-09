FROM node:20

WORKDIR /app

# Copy everything (except what is in .dockerignore)
COPY . .

# Install dependencies (runs postinstall: quasar prepare)
RUN npm install

# Expose Quasar port (default 9000 for spa)
EXPOSE 9000

# Run quasar dev with host bind
CMD ["npx", "quasar", "dev", "-m", "spa", "--host", "0.0.0.0"]
