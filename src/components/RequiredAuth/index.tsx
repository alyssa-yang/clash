import { Layout, Spin } from "antd";
import { Outlet } from "react-router-dom";
import Login from "../Login";
import useGlobalStore from "src/store/globalStore";

const { Header } = Layout

export default function RequiredAuth() {
    const loading = useGlobalStore(state => state.loading)
    const headerStyle: React.CSSProperties = {
        textAlign: "center",
        color: "#fff",
        height: 64,
        paddingInline: 10,
        lineHeight: "64px",
        backgroundColor: "black",
    };
    return <Layout>
        <Spin size="large" spinning={loading}>
            <Header style={headerStyle}>
                <Login />
            </Header>
            <Outlet />
        </Spin>
    </Layout>
}