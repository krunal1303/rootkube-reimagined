import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    // Lenis owns scroll position; router restoration would fight it.
    scrollRestoration: false,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
