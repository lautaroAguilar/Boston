import { NextResponse } from "next/server";

export function middleware(req) {
  const accessToken = req.cookies.get("access_token");
  const refreshToken = req.cookies.get("refresh_token");
  const { pathname } = req.nextUrl;

  // Dejamos la redirección desde / a /inicio por si alguien accede directamente a la raíz
  if (accessToken && pathname === "/") {
    return NextResponse.redirect(new URL("/inicio", req.url));
  }

  // Si tiene token, permitir acceso
  if (accessToken) {
    return NextResponse.next();
  }

  // Si tiene refresh token, permitir para refrescar
  if (refreshToken) {
    return NextResponse.next();
  }

  // Si no está en /autenticacion y no tiene tokens, redirigir a autenticación
  if (!pathname.includes("/autenticacion")) {
    return NextResponse.redirect(new URL("/autenticacion", req.url));
  }

  return NextResponse.next();
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
