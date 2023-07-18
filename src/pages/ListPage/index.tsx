import { useEffect, useState } from "react";
import { Card, Space, Table, Button, Divider, Modal, message } from "antd";
import { Link } from "react-router-dom";
import Axios from "src/request/axios";
import { deleteCanvasByIdEnd, getCanvasListEnd } from "src/request/end";
import useUserStore from "src/store/userStore";

type ListItem = {
    id: number;
    type: string;
    title: string;
    content: string;
};

const { confirm } = Modal;

export default function List() {
    const [list, setList] = useState<ListItem[]>([]);
    const isLogin = useUserStore(state => state.isLogin)

    const fresh = async () => {
        if (!isLogin) {
            return
        }
        const res: any = await Axios.get(getCanvasListEnd)
        const data = res.content || []
        setList(data)
    };

    const delConfirm = (id: number) => {
        confirm({
            title: '删除',
            content: '您确定要删除吗？',
            onOk: async () => {
                await Axios.post(deleteCanvasByIdEnd, { id })
                message.success('删除成功')
                fresh()
            }
        })
    }
    useEffect(() => {
        fresh();
    }, []);


    const editUrl = (item: ListItem) => `/?id=${item.id}&type=${item.type}`;
    const columns = [
        {
            title: "id",
            key: "id",
            render: (item: ListItem) => {
                return <Link to={editUrl(item)}>{item.id}</Link>;
            },
        },
        {
            title: "标题",
            key: "title",
            render: (item: ListItem) => {
                const title = item.title || "未命名";
                return <Link to={editUrl(item)}>{title}</Link>;
            },
        },

        {
            title: "类型",
            key: "type",
            render: (item: ListItem) => {
                const typeDesc = item.type === "content" ? "页面" : "模板页";
                return <div className="red">{typeDesc}</div>;
            },
        },

        {
            title: "动作",
            key: "action",
            render: (item: ListItem) => {
                const { id } = item;
                return (
                    <Space size="middle">
                        {/* <a
                            target="_blank"
                            href={"https://builder-lemon.vercel.app/?id=" + id}>
                            线上查看（切移动端）
                        </a> */}

                        <Link to={editUrl(item)}>编辑</Link>
                        <Button onClick={() => delConfirm(id)}>删除</Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <Card>
            <Link to={"/"}>新增</Link>
            <Divider />

            <Table
                columns={columns}
                dataSource={list}
                rowKey={(record: ListItem) => record.id}
            />
        </Card>
    );
}