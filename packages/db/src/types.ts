import { type Message } from "./schema.js";

export interface MessageWithTag extends Message {
  name: string | null;
}
