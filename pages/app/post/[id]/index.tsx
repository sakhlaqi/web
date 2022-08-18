import TextareaAutosize from "react-textarea-autosize";
import { useDebounce } from "use-debounce";
import { useState, useEffect } from "react";
import Layout from "@/components/app/Layout";
import Loader from "@/components/app/Loader";
import {useSelector, useDispatch} from 'react-redux';
import {wrapper, State} from '../../../../store';
import type { ChangeEvent } from "react";
import dynamic from "next/dynamic";

let Editor = dynamic(() => import("@/components/app/Editor"), {
    ssr: false
});

export default function Post() {

  const { post } = useSelector<State, State>(state => state);
  const dispatch = useDispatch();

  if (!post) {
      return (
        <Layout>
          <Loader />
        </Layout>
    )
  }

  const [data, setData] = useState(post);
  
  const [debouncedData] = useDebounce(data, 1000);
  useEffect(() => {
    if (debouncedData.title) dispatch({type: 'POST', payload: JSON.parse(JSON.stringify(data))});
  }, [debouncedData]);

  return (
    <>
      <Layout siteId={post?.site?.id}>
        <div className="max-w-screen-xl mx-auto px-10 sm:px-20 mt-10 mb-16">
          <TextareaAutosize
            name="title"
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({
                ...data,
                title: (e.target as HTMLTextAreaElement).value,
              })
            }
            className="w-full px-2 py-4 text-gray-800 bg-transparent text-5xl font-cal resize-none border-none focus:outline-none focus:ring-0"
            placeholder="Untitled Post"
            value={data?.title || ''}
          />
          <Editor data={data?.preview} />
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps = wrapper.getServerSideProps(store => async ({req, res, params}) => {
  //@ts-ignore
  const {id} = params;
  const post = await prisma?.post.findFirst({
    where: {
      id: id
    },
    include: {
      site: true,
    }
  });
  store.dispatch({type: 'POST', payload: JSON.parse(JSON.stringify(post))});
  return {
      props: {
          id,
      }
  }
})