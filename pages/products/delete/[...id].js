import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DeleteProductPage(){
    const router = useRouter();
    const [productInfo, setProductInfo] = useState();
    const {id} = router.query;
    function goBack(){
        router.push("/products");
    }
    useEffect(() => {
        if(!id){
            return;
        }        
        axios.get("/api/products?id="+id).then(response => {
            setProductInfo(response.data);
        })
    },[id])
    async function deleteProduct(){
        await axios.delete("/api/products?id="+id);
        goBack();
    }
    return(
        <Layout>
            <h1 className="text-center">ARE YOU SURE YOU WANT TO DELET THIS
                &nbsp;"{productInfo?.title}" ? </h1>
            <div className="flex gap-2 justify-center">
                <button onClick={deleteProduct} className="btn-red">YES</button>
                <button className="btn-default" 
                onClick={goBack}>
                    NO
                </button>
            </div>
        </Layout>   
    );
}