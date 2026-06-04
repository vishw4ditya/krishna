import { withAuth } from "next-auth/middleware";

export default withAuth();

export const config = {
  matcher: ["/dashboard/:path*", "/api/branches/:path*", "/api/products/:path*", "/api/chats/:path*"],
};
