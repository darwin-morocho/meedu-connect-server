/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import CryptoJS from 'crypto-js';

export default class AES {
  static decrypt = (encrypted: any, isJSON = false): any => {
    const decryptedData = CryptoJS.AES.decrypt(encrypted, process.env.CRYPTO_SECRET!).toString(
      CryptoJS.enc.Utf8
    );
    return isJSON ? JSON.parse(decryptedData) : decryptedData;
  };

  static encrypt = (data: any, isJSON = false): string =>
    CryptoJS.AES.encrypt(
      isJSON ? JSON.stringify(data) : data,
      process.env.CRYPTO_SECRET!
    ).toString();
}
