import "@/styles/globals.css";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import type { AppProps } from "next/app";
import { PrimeReactProvider } from 'primereact/api';
import Layout from "@/components/layout";
        

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PrimeReactProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PrimeReactProvider>
  );
}
