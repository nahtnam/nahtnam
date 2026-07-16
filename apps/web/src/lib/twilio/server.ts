import twilio from "twilio";

type ValidateTwilioRequestOptions = {
  authToken: string;
  request: Request;
  url: string;
};

type TwilioRequestValidation =
  | { parameters: URLSearchParams; response?: never }
  | { parameters?: never; response: Response };

function createXmlResponse(body: string) {
  return new Response(body, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    status: 200,
  });
}

function toTwilioParameters(parameters: URLSearchParams) {
  const result: Record<string, string | string[]> = {};

  for (const name of new Set(parameters.keys())) {
    const values = parameters.getAll(name);
    result[name] = values.length === 1 ? (values[0] ?? "") : values;
  }

  return result;
}

export function createMessageResponse(options: { message?: string }) {
  const { message } = options;
  const response = new twilio.twiml.MessagingResponse();

  if (message) {
    response.message(message);
  }

  return createXmlResponse(response.toString());
}

export async function validateTwilioRequest(
  options: ValidateTwilioRequestOptions
): Promise<TwilioRequestValidation> {
  const { authToken, request, url } = options;
  const signature = request.headers.get("x-twilio-signature");
  const contentType = request.headers.get("content-type") ?? "";

  if (
    !signature ||
    !contentType.startsWith("application/x-www-form-urlencoded")
  ) {
    return { response: new Response("Unauthorized", { status: 401 }) };
  }

  const parameters = new URLSearchParams(await request.text());
  const isValid = twilio.validateRequest(
    authToken,
    signature,
    url,
    toTwilioParameters(parameters)
  );

  return isValid
    ? { parameters }
    : { response: new Response("Unauthorized", { status: 401 }) };
}
