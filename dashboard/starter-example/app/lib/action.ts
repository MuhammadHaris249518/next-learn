'use server';
import {z} from 'zod';
import { signIn } from '../auth';
import { AuthError } from 'next-auth';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { UpdateInvoice } from '../ui/invoices/buttons';
const sql=postgres(process.env.POSTGRESS_URL!,{ssl:'require'});
import { omit } from 'zod/v4-mini';
import { redirect } from 'next/navigation';
import { CreateInvoice } from '../ui/invoices/buttons';
import { error, log } from 'console';
export async function authenticate(
    prevState:string|undefined,
    formData:FormData,){
    try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/dashboard',   // ✅ IMPORTANT
    });}
    catch(error){
if(error instanceof AuthError){
    switch(error.type){
        case'CredentialsSignin':
        return 'invalide credentials';
        default:
            return 'something went wrong';
    }
}
throw error;
    }
}
const formSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
export type State={
    errors?:{
        customerId?:string[];
        amount?:string[];
        status?:string[];
    };
    message?:string|null;

    
}
const Createinvoice=formSchema.omit({id:true,date:true});
export async function createinvoice(
  prevState: State,
  formData: FormData
): Promise<State>
{
    const validatedFields=Createinvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    // if form validation failed
      if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
 const{customerId,amount,status}=validatedFields.data;
    const amountinCents=amount*100;
    const date=new Date().toISOString().split('T')[0];
    try{
    await sql`
    INSERT INTO invoices (customer_id,amount,status,date)
    VALUES (${customerId},${amountinCents},${status},${date})
    `;}
    catch(error){
        console.log(error);
        return{
         message: 'Database error Failed to create invoice',

        };
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');



 
}
const Updateinvoice=formSchema.omit({id:true,date:true});
export async function updateinovice(id:string,formData:FormData){
    const {customerId,amount,status}=Updateinvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    const amountinCents=amount*100;
    const date=new Date().toISOString().split('T')[0];
    try{
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountinCents}, status = ${status}
    WHERE id = ${id}
  `;}
  catch(error){
    console.error(error);
    return{
        message:'Database Error: Failed to update invoice'
    };
  }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');



 
}
export async function deleteInvoice(id:string){
    await sql`DELETE FROM invoices where id=${id}`;
    revalidatePath('/dashboard/invoices');
}