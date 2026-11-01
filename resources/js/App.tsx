import React from "react";
import { Provider } from "react-redux";
import CoreUIApp from "./coreui-template/App";
import store from "./coreui-template/store";

export default function App() {
    return <Provider store={store}><CoreUIApp /></Provider>;
}
