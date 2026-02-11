'use server';
import {z} from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql=postgres(process.env.POSTGRESS_URL!,{ssl:'require'});
import { omit } from 'zod/v4-mini';
import { redirect } from 'next/navigation';
import { CreateInvoice, UpdateInvoice } from '../ui/invoices/buttons';
import { log } from 'console';
const formSchema=z.object({
    id:z.string(),
    customerId:z.string(),
    amount:z.coerce.number(),
    status:z.enum(['pending','paid']),
    date:z.string(),

});
const Createinvoice=formSchema.omit({id:true,date:true});
export async function createinvoice(formData:FormData){
    const {customerId,amount,status}=Createinvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
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