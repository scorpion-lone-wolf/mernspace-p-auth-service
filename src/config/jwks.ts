import jwksClient from "jwks-rsa";
import { Config } from ".";

export const jwkClient = jwksClient({
  jwksUri: Config.JWKS_URI
});
