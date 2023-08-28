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

import { ProductsCard } from "../components";

export default function HomePage() {
  return (
    <Page narrowWidth>
      <TitleBar title={"hello world!"} primaryAction={null} />
      <Layout>
        <Layout.Section>
          <p>hi3</p>
        </Layout.Section>
        <Layout.Section>
          <p>hello!</p>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
