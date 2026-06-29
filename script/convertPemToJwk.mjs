import { exportJWK, importSPKI } from "jose";
import fs from "node:fs";
import path from "node:path";
const __dirname = import.meta.dirname;
const pem = fs.readFileSync(path.join(__dirname, "../keys/public.pem"), "utf8");

const key = await importSPKI(pem, "RS256");
const jwk = await exportJWK(key);
const jwks = {
  keys: [
    {
      ...jwk,
      kid: "auth-key-1",
      use: "sig",
      alg: "RS256"
    }
  ]
};
console.log(JSON.stringify(jwks));
