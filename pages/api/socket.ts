import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/src/types/socket";
import { Server } from "socket.io";

export default function handler(_req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket_io",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      socket.on("chat:message", (payload) => {
        io.emit("chat:message", {
          ...payload,
          deliveredAt: new Date().toISOString(),
        });
      });

      socket.on("presence:update", (payload) => {
        io.emit("presence:update", payload);
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
