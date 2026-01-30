import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { convex } from "@/lib/convex-client"
import { api } from "../convex/_generated/api"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GitHub,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const internalKey = process.env.PRIGIDFY_STUDIO_CONVEX_INTERNAL_KEY!
        const user = await convex.query(api.system.getUserByEmail, {
          internalKey,
          email: credentials.email as string
        })

        if (!user || !user.password) return null

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordCorrect) return null

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const internalKey = process.env.PRIGIDFY_STUDIO_CONVEX_INTERNAL_KEY!
        await convex.mutation(api.system.createUser, {
          internalKey,
          email: user.email!,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          githubId: user.id
        })
      }
      return true
    },
  }
})
