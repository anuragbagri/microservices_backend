import { PrismaCleint } from "../generated/prisma";

export const prisma = new PrismaCleint({
    log : process.env.NODE_ENV
});


