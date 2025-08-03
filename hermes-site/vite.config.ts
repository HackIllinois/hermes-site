import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenvSafe from 'dotenv-safe';

// https://vite.dev/config/
dotenvSafe.config({
    example: '.env.example', // lists required VITE_ vars
    allowEmptyValues: false,
});
  

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 3000 by default
    host: true, // This allows external connections if needed
  },
})
