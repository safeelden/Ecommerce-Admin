import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    useEffect(() =>{
        axios.get("/api/orders").then(Response => {
            setOrders(Response.data)}
        );
    },[])
    return(
        <Layout>
            <div>Order</div>
            <table className="basic mt-4">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Paid</th>
                        <th>Recipint</th>
                        <th>Products</th>
                    </tr>
                </thead>
                <tbody>
                    {orders?.length > 0 && orders.map(order => (
                        <tr>
                            <td>{(new Date(order.createdAt).toLocaleString())}</td>
                            <td className={order.paid? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                {order.paid ? "YES" : "NO"}
                            </td>
                            <td>
                                {order.name} {order.email} <br/>
                                {order.city} {order.postalCode} <br/>
                                {order.country} <br/>
                                {order.streetAderss}
                            </td>
                            <td>
                                {order.line_items.map(l => (
                                    <>
                                    {l.price_data?.product_data.name} x
                                    {l.quantity} <br/>
                                    
                                    </>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
}