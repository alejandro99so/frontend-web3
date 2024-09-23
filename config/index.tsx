import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";

import { cookieStorage, createStorage } from "wagmi";
import { avalancheFuji, sepolia } from "wagmi/chains";

// Your Reown Cloud project ID
export const projectId = String(process.env.NEXT_PUBLIC_PROJECT_ID);
console.log({ projectId });
// Create a metadata object
const metadata = {
  name: "Testing",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

// Create wagmiConfig
const chains = [avalancheFuji, sepolia] as const;
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});
