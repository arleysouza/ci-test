import request from "supertest";
import app from "../helpers/testApp"; // Express app
import crypto from "crypto";

describe("User Controller", () => {
  const userData = { username: "testeuser", password: "123456" };

  it("deve criar usuário com sucesso", async () => {
    const res = await request(app).post("/users").send(userData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe("Usuário criado com sucesso.");

    const check = await global.pool.query(
      "SELECT * FROM users WHERE username=$1",
      [userData.username]
    );
    expect(check.rows.length).toBe(1);
  });

  it("não deve permitir criar usuário duplicado", async () => {
    await request(app).post("/users").send(userData);
    const res = await request(app).post("/users").send(userData);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("deve realizar login e retornar token", async () => {
    await request(app).post("/users").send(userData);

    const res = await request(app).post("/users/login").send(userData);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("deve realizar logout e invalidar token", async () => {
    await request(app).post("/users").send(userData);

    const loginRes = await request(app).post("/users/login").send(userData);
    const token = loginRes.body.data.token;

    const res = await request(app)
      .post("/users/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const blacklisted = await global.redis.get(`blacklist:jwt:${tokenHash}`);
    expect(blacklisted).toBe("true");
  });
});
