import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/src/lib/db";
import { User } from "@/src/models/User";
import type { UserRole } from "@/src/types/auth";

async function ensureSuperAdmin() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return;

  const hashed = await bcrypt.hash(password, 10);
  await User.create({
    name: "Super Admin",
    email: email.toLowerCase(),
    password: hashed,
    role: "super_admin",
    approvalStatus: "approved",
  });
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();
        await ensureSuperAdmin();

        if (!credentials?.email || !credentials?.password) return null;

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user?.password) return null;

        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if (!validPassword) return null;

        if (user.role === "branch_head" && user.approvalStatus !== "approved") {
          throw new Error("Branch head registration is pending approval.");
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name,
          image: user.profileImage,
          role: user.role,
          branchId: user.branchId ? String(user.branchId) : undefined,
          approvalStatus: user.approvalStatus,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      await connectToDatabase();
      if (!profile?.email) return false;

      const email = profile.email.toLowerCase();
      const existing = await User.findOne({ email });

      if (!existing) {
        const googleProfile = profile as { picture?: string; name?: string; email?: string };
        await User.create({
          name: googleProfile.name ?? "Customer",
          email,
          role: "customer",
          approvalStatus: "approved",
          profileImage: googleProfile.picture,
        });
      }

      return true;
    },
    async jwt({ token }) {
      await connectToDatabase();
      const dbUser = token.email
        ? await User.findOne({ email: token.email.toLowerCase() })
        : null;

      if (dbUser) {
        token.role = dbUser.role as UserRole;
        token.branchId = dbUser.branchId ? String(dbUser.branchId) : undefined;
        token.approvalStatus = dbUser.approvalStatus;
        token.sub = String(dbUser._id);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as UserRole) ?? "customer";
        session.user.branchId = token.branchId as string | undefined;
        session.user.approvalStatus = token.approvalStatus as string | undefined;
      }

      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
