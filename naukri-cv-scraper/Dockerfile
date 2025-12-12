# Use the official Apify Node.js 20 image
FROM apify/actor-node:20

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all source files
COPY . ./

# Start the actor
CMD npm start
