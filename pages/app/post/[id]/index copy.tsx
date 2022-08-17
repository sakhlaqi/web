import TextareaAutosize from "react-textarea-autosize";
import { useDebounce } from "use-debounce";
import { useState, useEffect } from "react";
import Layout from "@/components/app/Layout";
import Loader from "@/components/app/Loader";
import {useSelector, useDispatch} from 'react-redux';
import {wrapper, State} from '../../../../store';
import type { ChangeEvent } from "react";

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
            className="w-full px-2 py-4 text-gray-800 placeholder-gray-400 mt-6 text-5xl font-cal resize-none border-none focus:outline-none focus:ring-0"
            placeholder="Untitled Post"
            value={data?.title || ''}
          />
          <TextareaAutosize
            name="description"
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({
                ...data,
                description: (e.target as HTMLTextAreaElement).value,
              })
            }
            className="w-full px-2 py-3 text-gray-800 placeholder-gray-400 text-xl mb-3 resize-none border-none focus:outline-none focus:ring-0"
            placeholder="No description provided. Click to edit."
            value={data?.description || ''}
          />

          <div className="relative mb-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300" />
            </div>
          </div>
          <TextareaAutosize
            name="content"
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({
                ...data,
                content: (e.target as HTMLTextAreaElement).value,
              })
            }
            className="w-full px-2 py-3 text-gray-800 placeholder-gray-400 text-lg mb-5 resize-none border-none focus:outline-none focus:ring-0"
            placeholder="No content yet, Click to edit..."
            value={data?.content || ''}
          />
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