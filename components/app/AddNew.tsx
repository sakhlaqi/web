import { useRouter } from "next/router";
import { useState } from "react";
import { HttpMethod } from "@/types";
import PlusIcon from "../../public/icons/plus.svg";

export default function AddNew() { 
    const router = useRouter();
    const { id: siteId } = router.query;
    //get the 3 part of the route and replace trailing letter s
    const _type = (router.asPath.split("/")[3]).replace(/(s$)/g, "");
    const [creatingNew, setCreatingNew] = useState(false);

    async function create(siteId: string) {
        try {
            // const res = await fetch(`/api/${_type}?siteId=${siteId}`, {
            const res = await fetch(`/api/page?siteId=${siteId}&type=${_type}`, {
            method: HttpMethod.POST,
            headers: {
                "Content-Type": "application/json",
            },
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/${_type}/${data.pageId}`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    if (! ['page','post'].includes(_type)) {
        return null;
    }

    return (
        <>
            <div className="font-cal flex items-center space-x-2 text-gray-700 pl-5 sm:hover:text-black sm:hover:bg-white">
                <button
                    onClick={() => {
                        setCreatingNew(true);
                        create(siteId as string);
                    }}
                    className={`${
                    creatingNew
                        ? "cursor-not-allowed bg-gray-300 border-gray-300"
                        : "bg-gray-200 text-black hover:bg-[#333] hover:text-white border-black"
                    } inline-flex items-center px-4 py-2 rounded-md shadow-sm text-medium font-thin focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500`}>
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" /> Add New
                </button>
            </div>
        </>
    )
}
