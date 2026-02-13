import NextAuth from 'next-auth';
import { authConfig } from './auth.congif';
import Credentials from 'next-auth/providers/credentials';
import {z} from 'zod';

import type { User } from './lib/definitions';
import bcrypt from 'bcrypt';
import postgres from 'postgres';
const sql=postgres(process.env.POSTGRESS_URL!,{ssl:'require'});
async function getUser(email:string):Promise<User|undefined>{
    try{
        const user=await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
        return user[0];


    }
    catch(error){
        console.error('Failed to fetch user:',error);
        throw new Error('failed to fetch user');

    }
}
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers:[Credentials({
    async authorize(credentials){
        const parsedcredentails=z.object({email:z.string().email(),password:z.string().min(6)})
        .safeParse(credentials);
        if(parsedcredentails.success){
            const{email,password}=parsedcredentails.data;
            const user=await getUser(email);
            if(!user)return null;
            const passwordmatch=await bcrypt.compare(password,user.password);
            if(passwordmatch) return user;
        }
        console.log('invalid credentials');
        return null;
    },
  })],
});