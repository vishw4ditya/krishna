export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/api/branches/:path*", "/api/products/:path*", "/api/chats/:path*"],
};
