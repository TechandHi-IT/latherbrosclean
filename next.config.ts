import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin", "firebase", "nodemailer"],
};

export default nextConfig;
