const axios = require("axios");

const BACKEND = "http://localhost:3000";

describe("Authentication", () => {
  test("User is able to signup", async () => {
    const username = "sanchit" + Math.random();
    const password = "password123";

    const response = await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(response.statusCode).toBe(200);
    const updatedResponse = await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    expect(updatedResponse.statusCode).toBe(400);
  });
});
