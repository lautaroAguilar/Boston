import { NextResponse } from "next/server";

export function middleware(req) {
  const accessToken = req.cookies.get("access_token");
  const refreshToken = req.cookies.get("refresh_token");
  const { pathname } = req.nextUrl;

  if (accessToken && pathname === "/") {
    return NextResponse.redirect(new URL("/inicio", req.url));
  }
  if (accessToken) {
    return NextResponse.next();
  }

  // Si no hay access_token pero sí refresh_token, permite que el usuario siga para que refresque el token
  if (refreshToken) {
    return NextResponse.next();
  }

  // Si no hay ninguno de los dos, redirige a autenticación
  return NextResponse.redirect(new URL("/autenticacion", req.url));
}

export const config = {
  matcher: [
    "/",
    "/inicio/:path*",
    "/estudiantes/:path*",
    "/docentes/:path*",
    "/grupos/:path*",
    "/cronograma/:path*",
    "/empresas/:path*",
  ],
};
