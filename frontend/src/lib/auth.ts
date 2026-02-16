import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { env } from 'process';
import { Polar } from "@polar-sh/sdk";

import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { db } from "~/server/db";



const polarClient = new Polar({
    accessToken: env.POLAR_ACCESS_TOKEN,
    server: "sandbox",
});

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
    },

    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "67f9710c-6b3e-4945-a239-544a0e69f277",
                            slug: "small",
                        },
                        {
                            productId: "939e1ed3-985d-465a-a3ed-085ddec0a605",
                            slug: "medium",
                        },
                        {
                            productId: "c5043eb3-6927-4e27-bdfc-b1ce6134c775",
                            slug: "large",
                        },
                    ],
                    successUrl: "/dashboard",
                    authenticatedUsersOnly: true,
                }),
                portal(),
                webhooks({
                    secret: env.POLAR_WEBHOOK_SECRET,
                    onOrderPaid: async (order) => {
                        const externalCustomerId = order.data.customer.externalId;

                        if (!externalCustomerId) {
                            console.error("No external customer ID found.");
                            throw new Error("No external customer ID found.");
                        }

                        const productId = order.data.productId;

                        let creditsToAdd = 0;

                        switch (productId) {
                            case "67f9710c-6b3e-4945-a239-544a0e69f277":
                                creditsToAdd = 50;
                                break;
                            case "939e1ed3-985d-465a-a3ed-085ddec0a605":
                                creditsToAdd = 200;
                                break;
                            case "c5043eb3-6927-4e27-bdfc-b1ce6134c775":
                                creditsToAdd = 400;
                                break;
                        }

                        await db.user.update({
                            where: { id: externalCustomerId },
                            data: {
                                credits: {
                                    increment: creditsToAdd,
                                },
                            },
                        });
                    },
                }),
            ],
        }),
    ],
});
