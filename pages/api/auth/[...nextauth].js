import GoogleProvider from 'next-auth/providers/google';
import NextAuth, { getServerSession } from 'next-auth';
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb"

const adminEmails = ['seif71521@gmail.com'];

const outhOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({session, token, user}) => {
      if(adminEmails.includes(session?.user?.email)){
        return session;
      }
      else{
        return false;
      }
    }
  }
}
export default NextAuth(outhOptions);

export async function isAdminRequest(req, res){
  const session = await getServerSession(req, res, outhOptions);
  if(!adminEmails.includes(session?.user?.email)){
    res.status(401);
    res.end();
    throw 'Not an Admin';
  }
}