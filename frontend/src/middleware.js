import { NextResponse } from "next/server";

export function middleware(req) {
  const accessToken = req.cookies.get("access_token");
  const refreshToken = req.cookies.get("refresh_token");
  const { pathname } = req.nextUrl;
  console.log("Middleware ejecutado en:", req.url);

  if (accessToken && pathname === "/") {
    console.log("Access token presente, permitiendo acceso...");
    return NextResponse.redirect(new URL("/inicio", req.url));
  }
  if (accessToken) {
    console.log("Access token presente, permitiendo acceso...");
    return NextResponse.next();
  }

  // Si no hay access_token pero sí refresh_token, permite que el usuario siga para que refresque el token
  if (refreshToken) {
    console.log(
      "No hay access_token, pero sí refresh_token. Dejando pasar para refrescar sesión..."
    );
    return NextResponse.next();
  }

  // Si no hay ninguno de los dos, redirige a autenticación
  console.log("No hay tokens. Redirigiendo a /autenticacion...");
  return NextResponse.redirect(new URL("/autenticacion", req.url));
}

export const config = {
  matcher: [
    "/",
    "/estudiantes/:path*",
    "/docentes/:path*",
    "/grupos/:path*",
    "/cronograma/:path*",
    "/empresas/:path*",
  ],
};
