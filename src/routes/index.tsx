import { createFileRoute } from "@tanstack/react-router";
import { RootKubeSite } from "@/components/rootkube-site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RootKube — Digital Product Engineering" },
      { name: "description", content: "RootKube engineers digital products, intelligent systems, cloud infrastructure and automation that solve real business problems." },
      { property: "og:title", content: "RootKube — Digital Product Engineering" },
      { property: "og:description", content: "Production-grade software, intelligent systems, cloud infrastructure and automation built around real business problems." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <RootKubeSite />;
}
