import clientInstance from "./client";
import serverInstance from "./server";

const getInstance = () => {
  if (typeof window !== "undefined") {
    return clientInstance;
  } else {
    return serverInstance;
  }
};

export default getInstance;
