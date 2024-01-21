import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

import { trophyImage } from "../assets";

// import { ProductsCard } from "../components";
import { useEffect } from "react";

import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { t } = useTranslation();
  useEffect(() => {
    async function getData() {
      const response = await fetch("/api/test");
      const data = await response.json();
      console.log(data);
    }

    getData();

    return () => {};
  }, []);

  return (
    <Page fullWidth>
      <TitleBar title={"hello world!"} primaryAction={null} />
      <Layout>
        <Layout.Section>{t("NotFound.heading")}</Layout.Section>
        <Layout.Section>
          <p>hello!</p>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
