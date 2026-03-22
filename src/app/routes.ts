import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Preview from "./pages/Preview";
import Result from "./pages/Result";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/preview",
    Component: Preview,
  },
  {
    path: "/result",
    Component: Result,
  },
]);
