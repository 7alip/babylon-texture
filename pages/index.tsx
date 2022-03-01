import type { NextPage } from "next";
import dynamic from "next/dynamic";

const Scene = dynamic(() => import("../components/scene"), { ssr: false });

const Home: NextPage = () => {
  return <Scene />;
};

export default Home;
