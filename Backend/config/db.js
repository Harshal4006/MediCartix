import mongoose from "mongoose";

const isMongoSrvDnsError = (error) => {
  const hostname = String(error?.hostname || "");
  return error?.syscall === "querySrv" && hostname.startsWith("_mongodb._tcp.");
};

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("Missing MONGO_URL environment variable");
    }

    try {
      await mongoose.connect(process.env.MONGO_URL);
    } catch (error) {
      const shouldFallbackDns =
        process.env.NODE_ENV !== "production" &&
        !process.env.DNS_SERVERS &&
        isMongoSrvDnsError(error);

      if (!shouldFallbackDns) throw error;

      const dns = await import("dns");
      dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

      await mongoose.connect(process.env.MONGO_URL);
    }

    console.log("DB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
