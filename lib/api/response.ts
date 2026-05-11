import { NextResponse } from "next/server";
import { z } from "zod";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export function ok<TData>(data: TData, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(code: ApiErrorCode, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export function validationFail(error: z.ZodError) {
  return NextResponse.json(
    {
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
        fields: z.flattenError(error).fieldErrors
      }
    },
    { status: 422 }
  );
}
