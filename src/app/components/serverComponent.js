// src/app/components/serverComponent.js
import Head from "next/head";
import ClientComponent from "./clientComponent";

const ServerComponent = async ({ initialClicks }) => {
  return (
    <>
      <Head>
        <title>Clicker Game</title>
      </Head>
      <ClientComponent initialClicks={initialClicks} />
    </>
  );
};

export default ServerComponent;
