import { serve } from "bun";
import index from "./index.html";
import { handleGetTransactions } from "./api/handlers/transactions";
import { handleExport } from "./api/handlers/export";

const server = serve({
  routes: {
    "/*": index,

    "/api/transactions": {
      GET: handleGetTransactions,
    },

    "/api/transactions/export": {
      GET: handleExport,
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
