
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetcher } from "@/lib/fetcher";
import LoadingDots from "@/components/app/loading-dots";

interface RowsProps {
    id: string
    type?: string
    title?: string | null
    name?: string | null
    description?: string | null
    content?: string | null
    slug: string
    createdAt: Date
    updatedAt: Date
    published?: boolean
    siteId: string | null
}
  
export default function Rows() {
    const router = useRouter();
    const { id: siteId } = router.query;
    //get the data type from the 3th part of the route
    const _types = (router.asPath.split("/")[3]);
    // and replace trailing letter s
    const _type = _types.replace(/(s$)/g, "");
    
    // if (!['post','page'].includes(_type)) {
    //     return null;
    // }

    const { data } = useSWR<any>(
        // siteId && `/api/${_type}?siteId=${siteId}&published=true`,
        // siteId && `/api/page?siteId=${siteId}&type=${_type}&published=true`,
        siteId && `/api/page?siteId=${siteId}&type=${_type}`,
        fetcher,
        {
            onSuccess: (data) => !data?.site && router.push("/"),
        }
    );
    
    return (
        <>
            {data && data.data ? (
                data.data.length > 0 ? (
                data.data.map((item:RowsProps) => (
                    <div key={item.id} className={`border-l-4 mb-1 ${item.published ?'border-emerald-500 bg-white hover:bg-sky-100' : 'border-gray-200 bg-slate-100 opacity-50 hover:bg-slate-50 hover:opacity-100'} items-center cursor-pointer align-items-center flex-row overflow-hidden`}>
                        <div className="flex border-b border-gray-200">
                            <Link href={`/${_type}/${item.id}`} >
                                <div className="font-cal flex-1 px-2 my-2" >
                                {item.title || item.name || item.slug || "Untitled"}
                                </div>
                            </Link>
                        </div>
                    {/* <a className="font-cal px-3 my-2 tracking-wide bg-slate-50 text-gray-600 text-gray-400 whitespace-nowrap"
                        href={`http://${data.site?.subdomain}.${process.env.ROOT_DOMAIN}/${_type != 'page' ?  _type + '/' : ''}${item.slug != 'home' ? item.slug : ''}`}
                        rel="noreferrer" target="_blank"
                    >
                        .../{item.slug} ↗
                    </a> */}
                    </div>
                ))
                ) : (
                <>
                    <div className="flex items-center hover:bg-gray-200 cursor-pointer align-items-center flex-row overflow-hidden border-b border-gray border-gray-200">
                    <div className="flex-1 px-2 pb-1 mb-2 text-slate-300 bg-gray-300" >&nbsp;</div>
                    <div className="w-48 pb-1 mb-2 bg-gray-200">&nbsp;</div>
                    </div>
                    <div className="text-center">
                    <p className="text-medium font-cal font-thin text-gray-400">
                        Nothing found, Click &quot;Add New&quot; to create one...
                    </p>
                    </div>
                </>
                )
            ) : (
                [0, 1].map((i) => (
                <div key={i} className="flex items-center hover:bg-gray-200 cursor-pointer align-items-center flex-row overflow-hidden border-b border-gray border-gray-200">
                    <div className="flex-1 px-2 pb-1 mb-2 text-slate-300 bg-gray-300 animate-pulse" ><LoadingDots/></div>
                    <div className="w-48 pb-1 mb-2 bg-gray-200 animate-pulse">&nbsp;</div>
                </div>
                ))
            )}
        </>
    )
}