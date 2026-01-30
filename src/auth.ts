import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token.accessToken) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session as any).accessToken = token.accessToken
      }
      if (token.id && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
