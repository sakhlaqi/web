import Layout from "@/components/app/Layout";
import Rows from "@/components/app/Rows";

export default function SitePages() {
  return (
    <Layout>
      <div className="py-20 max-w-screen-xl mx-auto px-10 sm:px-20">
        <div className="my-2 grid">
          <Rows/>
        </div>
      </div>
    </Layout>
  );
}
