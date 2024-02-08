import * as dotenv from "dotenv";

dotenv.config();

function getEnvVarAsString(name:string):string{
    const value =  process.env[name];
    if (value === undefined){
        throw new Error(`Environment variable ${name} cannot be null`);
    }
    return value
}

function getEnvVarAsNumber(name:string):number{
    const value =  getEnvVarAsString(name);
    const numberValue = Number(value);
    if (isNaN(numberValue)){
        throw new Error(`Environment variable ${name} is not a valid number`);
    }
    return numberValue
}

export const PORT = getEnvVarAsString('PORT');
export const FAUCET_PORT = getEnvVarAsString('FAUCET_PORT');
export const GOOGLE_RECAPTCHA_SITE_KEY = getEnvVarAsString('GOOGLE_RECAPTCHA_SITE_KEY');
export const GOOGLE_RECAPTCHA_SECRET_KEY = getEnvVarAsString('GOOGLE_RECAPTCHA_SECRET_KEY');
export const DENOM = getEnvVarAsString('DENOM');
export const MIN_SCORE = getEnvVarAsNumber('MIN_SCORE');
