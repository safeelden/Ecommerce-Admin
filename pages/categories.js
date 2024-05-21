import Layout from "@/components/Layout";
import axios from "axios";
import {useEffect, useState } from "react";
import swal from 'sweetalert2';


export default function Categories(){
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [editedCategory, setEditedCategory] = useState(null);
    const [properties, setProperties] = useState([]);

    function fetchCategory(){
        axios.get("/api/categories").then(result => {
            setCategories(result.data);
        })
    }
    useEffect(() => {
        fetchCategory();
    }, [])
    function addProperty(prev){
        setProperties(prev => {
            return [...prev, {name:"", value:""}];
        })
    }
    async function saveCategory(ev){
        ev.preventDefault();
        const data = {name,
            parentCategory,
            properties: properties.map(p => ({
                name:p.name,
                values:p.values.split(","),
            })),
        };
        if(editedCategory){
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
            setEditedCategory(null)
        }
        else{
            await axios.post('/api/categories', data);
        }
        setName('');
        setParentCategory("");
        setProperties([]);
        fetchCategory();
    }
    function editCategory(category){
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(category.properties.map(({name, values}) => ({
            name,
            values: values.join(",")
        }))
            );
    }
    function deleteCategory(category){
        swal.fire({
            title: 'Are you sure',
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true ,
            cancelButtonText: "Cancel",
            confirmButtonText: "Yes, Delete!",
            reverseButtons: true,
            confirmButtonColor: '#d55'
          }).then(async result => {
            if(result.isConfirmed){
                const {_id} = category;
                await axios.delete("/api/categories?_id="+_id);
                fetchCategory();
            }
          });
    }
    function handlePropertyNameChange(index, property, newName){
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        })
    }
    function handlePropertyValuesChange(index, property, newValues){
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        })
    }
    function removeProperty(indexToRemove){
        setProperties(prev => {
            return [...prev].filter((p,pIndex) => {
                return pIndex !== indexToRemove;
            });
        });
    }

    return(
        <Layout>
        <h1>Categories</h1>
        <label>{editedCategory? `Edit Category ${editedCategory.name}` : "Creat New Category"}</label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                <input 
                type="text" 
                placeholder="Category Name" 
                className=""
                onChange={ev => setName(ev.target.value)}
                value={name}
                />
                <select
                className=""
                onChange={ev => setParentCategory(ev.target.value)}
                value={parentCategory}
                >
                    <option value>No Parent Category</option>
                    {categories.length > 0 && categories.map(category => (
                        <option value={category._id}>{category.name}</option>
                    )
                    )}
                </select>
                </div>
                <div className="mb-2">
                    <label className="block">Properties</label>
                    <button 
                    onClick={addProperty}
                    type="button" className="btn-default text-sm mb-2">Add New Property</button>
                    {properties.length > 0 && properties.map((property,index) => (
                        <div className="flex gap-1 mb-2">
                            <input type="text"
                                className="mb-0"
                                placeholder="property name (example: color)"
                                value={property.name}
                                onChange={ev => handlePropertyNameChange(index,property,ev.target.value)}/>
                            <input type="text"
                                className="mb-0"
                                placeholder="values, comma seperated"
                                onChange={ev => handlePropertyValuesChange(index,property,ev.target.value)}
                                value={property.values}/>
                                <button 
                                    onClick={() => removeProperty(index)}
                                    type='button'
                                    className="btn-red">Remove</button>
                        </div>
                    ))}
                </div>
                <div className="flex gap-1">
                    <button type="submit" className="btn-primary py-1">Save</button>
                    {editedCategory && (
                        <button type="button"
                        onClick={() => {setEditedCategory(null);
                                        setName('');
                                        setParentCategory('');
                                        setProperties([]);
                                    }}
                        className="btn-default ">Cancel</button>
                    )}
                </div>
            </form>
            {!editedCategory && (
            <table className="basic mt-4">
            <thead>
                <tr>
                    <td>Category name</td>
                    <td>parent Category</td>
                    <td></td>
                </tr>
            </thead>
            <tbody>
                {categories.length > 0 && categories.map(category => (
                    <tr>
                        <td>{category.name}</td>
                        <td>{category?.parent?.name}</td>
                        <td>
                            <button
                            onClick={() => editCategory(category)}
                            className="btn-default mr-1"
                             >Edit</button>
                            <button
                            onClick={() => deleteCategory(category)}
                            className="btn-red">Delete</button>
                        </td>
                    </tr>
                )
                )}
            </tbody>
        </table>
            )}
        </Layout>
    )
}
