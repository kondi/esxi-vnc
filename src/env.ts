import dotenv from 'dotenv';

dotenv.config();

export const env = process.env as {
  ESXI_USERNAME?: string;
  ESXI_PASSWORD?: string;
  TUNNELS?: string;
};
