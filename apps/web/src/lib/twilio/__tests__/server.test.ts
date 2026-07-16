import twilio from "twilio";
import { describe, expect, test } from "vitest";

import { createMessageResponse, validateTwilioRequest } from "../server";

const authToken = "12345";
const parameters = {
  Body: "Hello from Twilio",
  From: "+14155550123",
  MessageSid: "SM123",
  To: "+18556248626",
};
const url = "https://www.nahtnam.com/api/twilio/sms";

function createSignedRequest() {
  const signature = twilio.getExpectedTwilioSignature(
    authToken,
    url,
    parameters
  );

  return new Request(url, {
    body: new URLSearchParams(parameters),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Twilio-Signature": signature,
    },
    method: "POST",
  });
}

describe("Twilio SMS webhook", () => {
  test("validates a signed request with the official SDK", async () => {
    const result = await validateTwilioRequest({
      authToken,
      request: createSignedRequest(),
      url,
    });

    expect(result.response).toBeUndefined();
    expect(result.parameters?.get("MessageSid")).toBe("SM123");
  });

  test("rejects an invalid signature", async () => {
    const request = createSignedRequest();
    request.headers.set("X-Twilio-Signature", "invalid");
    const result = await validateTwilioRequest({ authToken, request, url });

    expect(result.response?.status).toBe(401);
  });

  test("returns TwiML confirmation for a queued message", async () => {
    const response = createMessageResponse({ message: "PRINTED" });

    expect(response.headers.get("content-type")).toBe(
      "text/xml; charset=utf-8"
    );
    await expect(response.text()).resolves.toContain(
      "<Message>PRINTED</Message>"
    );
  });
});
