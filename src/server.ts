import { PassThrough } from "node:stream";
import type { ReadableStream } from "node:stream/web";
import {
  createStartHandler,
  StartServer,
  type RequestHandler,
} from "@tanstack/react-start/server";
import {
  defineHandlerCallback,
  transformPipeableStreamWithRouter,
  transformReadableStreamWithRouter,
} from "@tanstack/react-router/ssr/server";
import type { Register } from "@tanstack/react-router";
import { createElement } from "react";
import ReactDOMServer from "react-dom/server";

const allReadyStreamHandler = defineHandlerCallback(
  async ({ request, responseHeaders, router }) => {
    const children = createElement(StartServer, { router });

    if (typeof ReactDOMServer.renderToReadableStream === "function") {
      const stream = await ReactDOMServer.renderToReadableStream(children, {
        nonce: router.options.ssr?.nonce,
        progressiveChunkSize: Number.POSITIVE_INFINITY,
        signal: request.signal,
      });

      await stream.allReady;

      return new Response(
        transformReadableStreamWithRouter(
          router,
          stream as unknown as ReadableStream,
        ) as unknown as BodyInit,
        {
          headers: responseHeaders,
          status: router.state.statusCode,
        },
      );
    }

    if (typeof ReactDOMServer.renderToPipeableStream === "function") {
      const reactAppPassthrough = new PassThrough();

      await new Promise<void>((resolve, reject) => {
        const pipeable = ReactDOMServer.renderToPipeableStream(children, {
          nonce: router.options.ssr?.nonce,
          onAllReady() {
            pipeable.pipe(reactAppPassthrough);
            resolve();
          },
          onError(error, info) {
            console.error("Error in renderToPipeableStream:", error, info);
          },
          onShellError(error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          },
          progressiveChunkSize: Number.POSITIVE_INFINITY,
        });
      });

      return new Response(
        transformPipeableStreamWithRouter(
          router,
          reactAppPassthrough,
        ) as unknown as BodyInit,
        {
          headers: responseHeaders,
          status: router.state.statusCode,
        },
      );
    }

    throw new Error("No React streaming server renderer found.");
  },
);

const fetch = createStartHandler(allReadyStreamHandler);

type ServerEntry = { fetch: RequestHandler<Register> };

function createServerEntry(entry: ServerEntry): ServerEntry {
  return {
    async fetch(...arguments_) {
      return entry.fetch(...arguments_);
    },
  };
}

export default createServerEntry({ fetch });
