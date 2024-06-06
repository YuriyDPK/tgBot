// src/app/components/serverComponent.js
import Head from "next/head";
import MainGame from "./MainGame";

const ServerComponent = async ({ initialClicks, initialRep }) => {
  return (
    <>
      <Head>
        <title>Князь Руси</title>
      </Head>
      <MainGame initialClicks={initialClicks} initialRep={initialRep} />
    </>
  );
};
export async function getServerSideProps(context) {
  const { query } = context;
  const username = query.username || "default_username";

  const res = await fetch(`http://localhost:3000/api/user/${username}`);
  const user = await res.json();

  return {
    props: {
      initialClicks: user?.clicks || 0,
      initialRep: user?.reptation || 0,
    },
  };
}
export default ServerComponent;
