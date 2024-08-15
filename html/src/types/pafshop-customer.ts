export type Customer = {
  name: string;
  zipcode: string;
  address1: string;
  address2: string;
  tel: string;
  email: string;
  receipt: boolean | undefined;
  receiptName?: string;
  receiptDescription?: string;
  agreeToPrivacyPolicy: boolean;
};
