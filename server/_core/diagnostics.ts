type DiagnosticFailure = {
  requestId?: unknown;
  path?: unknown;
  code?: unknown;
};

export function trpcFailureDiagnostic({ requestId, path, code }: DiagnosticFailure) {
  return {
    event: "trpc_failure",
    requestId: typeof requestId === "string" ? requestId : "unavailable",
    path: typeof path === "string" ? path : "unknown",
    code: typeof code === "string" ? code : "UNKNOWN",
  };
}

export function logTrpcFailure(failure: DiagnosticFailure) {
  console.error("[server diagnostic]", JSON.stringify(trpcFailureDiagnostic(failure)));
}
