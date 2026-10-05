import { createContext, useContext } from "react";

/** True once the preloader has handed off (or was skipped/already seen this session). */
export const PreloadContext = createContext(false);

export function usePreloadDone() {
  return useContext(PreloadContext);
}
