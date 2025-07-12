import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/Login/Login";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
]);

const App = () => {
  return <RouterProvider router={routes} />;
};

export default App;
