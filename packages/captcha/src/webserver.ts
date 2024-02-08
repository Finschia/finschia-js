import { CaptchaFaucetService } from "./captchaserver";
import * as configuration from "./config";

import path from "path";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import views from "koa-views";
import cors from "@koa/cors";

const captchaFaucetService = new CaptchaFaucetService(
  configuration.FAUCET_PORT,
  configuration.GOOGLE_RECAPTCHA_SECRET_KEY,
  configuration.DENOM,
  configuration.MIN_SCORE,
);

const app = new Koa();
app.use(cors());
app.use(bodyParser());
app.use(
  views(path.join(__dirname, "../views"), {
    extension: "ejs",
  }),
);
app.use(async (context) => {
  switch (context.path) {
    case "/":
      await context.render("captcha", { recaptchaSiteKey: configuration.GOOGLE_RECAPTCHA_SITE_KEY });
      break;
    case "/submit-captcha":
      if (context.request.method !== "POST") {
        context.status = 405;
        context.message = "This endpoint requires a POST request";
      }
      if (context.request.type !== "application/json") {
        context.status = 415;
        context.message = "Content-type application/json expected";
      }
      const requestBody = (context.request as any).body;
      const { address, recaptchaResponse } = requestBody;
      try {
        await captchaFaucetService.creditWithCaptcha(address, recaptchaResponse);
        context.status = 200;
        context.body = { message: "Succeeded" };
      } catch (error: any) {
        context.status = 405;
        context.body = { message: error.message };
      }
      break;
    default:
    // koa sends 404 by default
  }
});

app.listen(configuration.PORT, () => {
  console.log(`captcha service is listening on ${configuration.PORT}`);
});
