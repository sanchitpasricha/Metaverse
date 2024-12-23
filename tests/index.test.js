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
    expect(response.data.userId).toBeTruthy();

    // Fail in case of trying to sign up using same username
    const updatedResponse = await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });
    expect(updatedResponse.statusCode).toBe(400);
  });

  test("Signup requests fails if the username is empty", async () => {
    const username = `Sanchit-${Math.random()}`;
    const password = "password123";

    const response = await axios.post(`${BACKEND}/api/v1/signup`, {
      password,
    });

    expect(response.statusCode).toBe(400);
  });

  test("Signin succeeds if the username and password are correct", async () => {
    const username = `Sanchit-${Math.random()}`;
    const password = "password123";

    await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
    });

    const response = await axios.post(`${BACKEND}/api/v1/signin`, {
      username,
      password,
    });

    expect(response.statusCode).toBe(200);
    expect(response.data.token).toBeTruthy();
  });

  test("Signin fails if the username and password are incorrect", async () => {
    const username = `sanchit-${Math.random()}`;
    const password = "password123";

    await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
    });

    const response = await axios.post(`${BACKEND}/api/v1/signin`, {
      username,
      password: "wrong_password",
    });

    expect(response.statusCode).toBe(401);
  });
});

describe("User Metadata endpoints", function () {
  let token = "";
  let avatarId = 0;

  beforeAll(async () => {
    const username = `sanchit-${Math.random()}`;
    const password = "password123";

    await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    const response = await axios.post(`${BACKEND}/api/v1/signin`, {
      username,
      password,
    });

    token = response.token; // returns token

    const avatarResponse = await axios.post(`${BACKEND}/api/v1/admin/avatar`, {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      name: "Timmy",
    });

    avatarId = avatarResponse.avatarId;
  });

  test("User can't change their metadata with a wrong avatar id", async () => {
    const response = await axios.post(
      `${BACKEND}/api/v1/metadata`,
      {
        avatarId: 1122,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    expect(response.statusCode).toBe(400);
  });

  test("User can update their avatar with right avatar id", async () => {
    const response = await axios.post(
      `${BACKEND}/api/v1/metadata`,
      {
        avatarId,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    expect(response.statusCode).toBe(200);
  });

  test("User is not able to update their matadata if the auth header is not present", async () => {
    const response = await axios.post(`${BACKEND}/api/v1/metadata`, {
      avatarId: 1122,
    });

    expect(response.statusCode).toBe(403);
  });
});

describe("User avatar information", async () => {
  let avatarId;
  let token;
  let userId;

  beforeAll(async () => {
    const username = `sanchit-${Math.random()}`;
    const password = "password123";

    const signupResponse = await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    userId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND}/api/v1/signin`, {
      username,
      password,
    });

    token = response.token; // returns token

    const avatarResponse = await axios.post(`${BACKEND}/api/v1/admin/avatar`, {
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
      name: "Timmy",
    });

    avatarId = avatarResponse.avatarId;
  });

  test("Get back avatar information for a user", async () => {
    const response = await axios.get(
      `${BACKEND}/api/v1/user/metadata/bulk?ids=[${userId}]`
    );

    expect(response.data.avatars.length).toBe(1);
    expect(response.data.avatars[0].userId).toBe(userId);
  });

  test("Available avatars lists the recently created avatar", async () => {
    const response = axios.post(`${BACKEND}/api/v1/avatars`);
    expect(response.data.avatars.length).not.toBe(0);
    const currentAvatar = (await response).data.avatars.find(
      (x) => x.id == avatarId
    );
    expect(currentAvatar).toBeDefined();
  });
});

describe("Space information", () => {
  let mapId;
  let elementId1;
  let elementId2;
  let userToken;
  let userId;
  let adminId;
  let adminToken;

  beforeAll(async () => {
    const username = `sanchit-${Math.random()}`;
    const password = "password123";

    const signupResponse = await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    adminId = signupResponse.data.userId;

    const response = await axios.post(`${BACKEND}/api/v1/signin`, {
      username,
      password,
    });

    adminToken = response.token;

    const userSignupResponse = await axios.post(`${BACKEND}/api/v1/signup`, {
      username,
      password,
      type: "admin",
    });

    userId = userSignupResponse.data.userId;

    const userSigninResponse = await axios.post(`${BACKEND}/api/v1/signin`, {
      username,
      password,
    });

    userToken = userSigninResponse.token;

    const element1 = await axios.post(
      `${BACKEND}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const element2 = await axios.post(
      `${BACKEND}/api/v1/admin/element`,
      {
        imageUrl:
          "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
        width: 1,
        height: 1,
        static: true,
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    elementId1 = element1.id;
    elementId2 = element2.id;
    const map = await axios.post(
      `${BACKEND}/api/v1/admin/map`,
      {
        thumbnail: "https://thumbnail.com/a.png",
        dimensions: "100x200",
        name: "100 person interview room",
        defaultElements: [
          {
            elementId: elementId1,
            x: 20,
            y: 20,
          },
          {
            elementId: elementId2,
            x: 18,
            y: 20,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    map = map.id;
  });

  test("");
});
