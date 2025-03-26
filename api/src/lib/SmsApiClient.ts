export class SmsApiClient {
  private userId = "";
  private password = "";
  private entityId = "";
  private baseApi = "";

  constructor() {
    this.userId = process.env.USER_ID || "";
    this.password = process.env.PASSWORD || "";
    this.entityId = process.env.ENTITY_ID || "";
    this.baseApi = process.env.SMS_BASE_URL || "";
  }

  async sendSingleSms(
    phoneNumber: string,
    message: string,
    institute: "Kolkata" | "Faridabad"
  ) {
    const encodedMessage = encodeURIComponent(message);
    const encodedPassword = encodeURIComponent(this.password);
    const SENDER_ID = institute === "Kolkata" ? "SEIKOL" : "SEIFDB";
    const TEMPLATE_ID =
      institute === "Kolkata" ? "1207174237791062171" : "1207174237551539278";

    const url = `${this.baseApi}/SendSingleApi?UserID=${this.userId}&Password=${encodedPassword}&SenderID=${SENDER_ID}&Phno=${phoneNumber}&Msg=${encodedMessage}&EntityID=${this.entityId}&TemplateID=${TEMPLATE_ID}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Unable to send OTP, try again later");

      const data = await response.json();
      if (data.Status === "OK") return data;

      throw new Error("Unable to send OTP, try again later");
    } catch {
      throw new Error("Unable to send OTP, try again later");
    }
  }
}
