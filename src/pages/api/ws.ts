import { NextApiRequest, NextApiResponse } from "next";

export function WSHandler(req: NextApiRequest, res: NextApiResponse): void {
  const socket = new WebSocket("ws://localhost:3000/api/ws");

  socket.addEventListener("open", (e) => {
    socket.send(`connection opened ${e.timeStamp}`);
  });
  socket.addEventListener("message", (e) => {
    console.log(`Message from server ${e.data}`);
  });
  socket.addEventListener("close", (e) => {
    socket.send(`connection closeed ${e.timeStamp}`);
  });
}
