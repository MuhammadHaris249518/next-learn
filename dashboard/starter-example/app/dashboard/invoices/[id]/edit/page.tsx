import Form from "@/app/ui/invoices/create-form";
import Breadcrumbs from "@/app/ui/invoices/breadcrumbs";
import { customers } from "@/app/lib/placeholder-data";
import { promise } from "zod/v4-mini";
import { notFound } from "next/navigation";
import { fetchInvoiceById,fetchCustomers } from "@/app/lib/data";
export default async function Page(props:{params:Promise<{id:string}>}){
    const params=await props.params;
    const id=params.id;
    const[invoice,customers]=await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);
    if(!invoice){
        notFound();
    }

    return(
        <main>
        <Breadcrumbs
        breadcrumbs={[
            {label:'Invoices',href:'/dashboard/invoices'},
            {
                label:'Edit Invoice',
                href:`/dashboard/invoices/${id}/edit`,
                active:true,
            },
        ]}
        />
        <Form invoice={invoice}  customers={customers}/>
        
        </main>
    );
    }
