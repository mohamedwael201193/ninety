// pdfjs-dist 6 (used only by tests to read PDFs back) needs Promise.withResolvers, which Node 20 lacks.
const P = Promise as unknown as { withResolvers?: () => unknown };
if (!P.withResolvers) {
  P.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
  };
}
