import { FaucetClient } from "@cosmjs/faucet-client";
import axios from "axios";

export class CaptchaFaucetService {
  private readonly faucetClient: FaucetClient;
  private readonly recaptchaSecretKey: string;
  private readonly denom: string;
  private readonly minScore: number;

  constructor(faucetPort: string, recaptchaSecretKey: string, denom: string, minScore: number) {
    const FAUCET_URL="http://localhost:"+faucetPort;
    this.faucetClient = new FaucetClient(FAUCET_URL);
    this.recaptchaSecretKey = recaptchaSecretKey;
    this.denom = denom;
    this.minScore = minScore;
  }

  private async verifyRecaptcha(captchaResponse: string): Promise<void> {
    const response = await axios.post("https://www.google.com/recaptcha/api/siteverify", null, {
      params: {
        secret: this.recaptchaSecretKey,
        response: captchaResponse,
      },
    });
    if (!response.data.success || response.data.score < this.minScore) {
      throw new Error("captcha verification failed");
    }
  }

  public async creditWithCaptcha(address: string, captchaToken: string): Promise<void> {
    try {
      await this.verifyRecaptcha(captchaToken);
      await this.faucetClient.credit(address, this.denom);
    } catch (error: any){
      throw Error(error.message);
    }
  }
}
