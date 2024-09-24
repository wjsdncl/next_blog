import instance from "./axios";

export const getUser = async () => {
  return await instance.get("/users");
};
