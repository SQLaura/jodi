import { Collection } from "discord.js";
import { PrismaClient } from "./generated/prisma";

declare module "discord.js" {
  export interface Client {
    commands: Collection<any, any>;
    db: PrismaClient;
  }
}
