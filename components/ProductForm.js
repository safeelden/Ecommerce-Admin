import  axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
export default function ProductForm({
    _id,
    title:existingTitle,
    description:existingDescription,
    price:existingPrice,
    images: existingImages,
    category: assignedCategory,
    properties: assignedProperties,
}){
    const [title, setTitle] = useState(existingTitle || "");
    const [description, setDescription] = useState(existingDescription || "");
    const [price, setPrice] = useState(existingPrice || "");
    const [goToProducts, setGoToProducts] = useState(false);
    const [images, setImages] = useState(existingImages ||[])
    const [isUploading, setIsUploading] = useState(false);
    const [category, setCategory] = useState(assignedCategory || "");
    const [categories, setCategories] = useState([]);
    const [productProperties, setProductProperties] = useState(assignedProperties || {});
    const router = useRouter();
    useEffect(() => {
        axios.get('/api/categories').then(result => (
            setCategories(result.data)
        ))
    }, []);

    async function saveProduct(ev){
        ev.preventDefault();
        const data = {title, description, price, images, category, properties:productProperties};
        if(_id){
            //update product
            await axios.put("/api/products", {...data, _id});
        }
        else{
            //create product
            await axios.post("/api/products", data);
        }
        setGoToProducts(true);
    }
    if(goToProducts){
        router.push("/products");
    }
    async function uploadImages(ev){
        const files = ev.target?.files;
        if(files?.length > 0){
            setIsUploading(true);
            const data = new FormData();
            for(const file of files){
                data.append("file", file);
            }
            const res = await axios.post("/api/upload", data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }
    function setProductProp(propName, value){
        setProductProperties(prev => {
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps
        })
    }
    const propertiesToFill = [];
    if(categories.length > 0 && category){
        let catInfo = categories.find(({_id}) => _id === category);
        propertiesToFill.push(...catInfo.properties);
        while(catInfo?.parent?._id){
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            catInfo = parentCat;
        }
    }
    function updateImagesOrder(images){
        setImages(images);
    }
    return(
        <form onSubmit={saveProduct}>
        <label>Product name</label>
        <input 
        type="text" 
        placeholder="product name" 
        value={title}
        onChange={ev => setTitle(ev.target.value)}/>
        <label>Category</label>
        <select value={category}
        onChange={ev => setCategory(ev.target.value)}>
            <option value="">UnCategorized</option>
            {categories.length > 0 && categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
            ))}
        </select>
        {propertiesToFill.length > 0 && propertiesToFill.map(p => (
            <div key={p.name} className="flex gap-2">
                <label>{p.name[0].toUpperCase() +p.name.substring(1)}</label>
                <div>
                    <select 
                        value={productProperties[p.name]}
                        onChange={ev => setProductProp(p.name,ev.target.value)}>
                            {p.values.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                    </select>
                </div>
            </div>
        ))}
        <label>
            <div>Photos</div>
        </label>
        <div className="mb-2 flex flex-wrap gap-2">
            <ReactSortable 
                list={images}
                setList={updateImagesOrder}
                className="flex flex-wrap gap-2">         
                {!!images?.length && images.map(link => (
                    <div key={link} className="h-36  bg-white shadow-sm border border-gray-200 rounded-lg">
                        <img src={link} alt="" className="rounded-lg"/>
                    </div>
                ))}
            </ReactSortable>
            {isUploading && (
                <div className="h-24 flex items-center">
                    <Spinner/>
                </div>
            )}
            <label className="border h-36 w-36 rounded-lg text-primary
                bg-gray-100 shadow-lg
                flex flex-col justify-center items-center text-sm cursor-pointer gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <div>Add image</div>
                <input type="file" onChange={uploadImages} className="hidden"/>
            </label>
        </div>
        <label>Description</label>
        <textarea 
            placeholder="description"
            value={description}
            onChange={ev => setDescription(ev.target.value)}/>
        <label>Price</label>
        <input 
            type="number" 
            placeholder="price"
            value={price}
            onChange={ev => setPrice(ev.target.value)}/>
        <button 
            className="btn-primary"
            type="submit"
        >Save
        </button>
        </form>
);
}