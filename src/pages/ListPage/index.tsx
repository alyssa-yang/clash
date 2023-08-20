import { useEffect, useState } from "react";
import { Card, Space, Table, Button, Divider, Modal, message, Image } from "antd";
import { Link } from "react-router-dom";
import Axios from "src/request/axios";
import { deleteCanvasByIdEnd, getCanvasListEnd, saveCanvasEnd, publishEnd, unpublishEnd, builderHost } from "src/request/end";
import useUserStore from "src/store/userStore";

type ListItem = {
    id: number;
    type: string;
    title: string;
    content: string;
    publish: boolean;
    thumbnail: {
        full: string
    }
};

const { confirm } = Modal;

const pagination = { pageSize: 9999, current: 1 };

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
    const copy = async (item: ListItem) => {
        const res = await Axios.post(saveCanvasEnd, {
            id: null,
            type: item.type,
            title: item.title + " 副本",
            content: item.content,
        });
        if (res) {
            message.success("复制成功");
            fresh();
        }
    }
    const saveAsTpl = async (item: ListItem) => {
        const res = await Axios.post(saveCanvasEnd, {
            id: null,
            type: "template",
            title: item.title + " 模板",
            content: item.content,
        });

        if (res) {
            message.success("保存模板成功");
            fresh();
        }
    };

    const publish = async (id: number) => {
        const res = await Axios.post(publishEnd, {
            id,
        });
        if (res) {
            message.success("发布成功");
            fresh();
        }
    };

    const unpublish = async (id: number) => {
        const res = await Axios.post(unpublishEnd, {
            id,
        });
        if (res) {
            message.success("下架成功");
            fresh();
        }
    };
    useEffect(() => {
        fresh();
    }, [isLogin]);


    const editUrl = (item: ListItem) => `/?id=${item.id}&type=${item.type}`;
    const columns = [
        {
            title: "id",
            key: "id",
            width: 100,
            render: (item: ListItem) => {
                return <Link to={editUrl(item)}>{item.id}</Link>;
            },
        },
        {
            title: "标题",
            key: "title",
            width: 200,
            render: (item: ListItem) => {
                const title = item.title || "未命名";
                return <Link to={editUrl(item)}>{title}</Link>;
            },
        },

        {
            title: "类型",
            key: "type",
            width: 100,
            render: (item: ListItem) => {
                const typeDesc = item.type === "content" ? "页面" : "模板页";
                return <div className="red">{typeDesc}</div>;
            },
        },
        {
            title: "缩略图",
            key: "thumbnail",
            width: 100,
            render: (item: ListItem) => {
                return (
                    item.thumbnail?.full && <Image src={item.thumbnail.full} alt={item.title} height={150} />
                );
            },
        },
        {
            title: "操作",
            key: "action",
            width: 200,
            fixed: 'right' as const,
            render: (item: ListItem) => {
                const { id } = item;
                return (<>
                    <Space size="middle">
                        <Link to={editUrl(item)}>编辑</Link>
                        {item.type === "content" && (
                            <>
                                {item.publish === false ? (
                                    <>
                                        <a
                                            target="_blank"
                                            href={
                                                `${builderHost}?id=` + id + "&preview"
                                            }>
                                            线下预览查看（切移动端）
                                        </a>
                                        <Button size="small" type="link" onClick={() => publish(id)}>发布</Button>
                                    </>
                                ) : (
                                    <>
                                        <a
                                            target="_blank"
                                            href={`${builderHost}?id=` + id}>
                                            线上查看（切移动端）
                                        </a>
                                        <Button size="small" type="link" onClick={() => unpublish(id)}>下架</Button>
                                    </>
                                )}
                            </>
                        )}

                    </Space>
                    <Space size="middle">
                        <Button type="link" size="small" onClick={() => copy(item)}>复制</Button>
                        <Button type="link" size="small" onClick={() => delConfirm(id)}>删除</Button>
                        <Button type="link" size="small" onClick={() => saveAsTpl(item)}>保存为模版</Button>
                    </Space>
                </>);
            },
        },
    ];

    return (
        <Card>
            <Link to={"/"}><Button type="primary">新增</Button></Link>
            <Divider />
            <Table
                columns={columns}
                dataSource={list}
                rowKey={(record: ListItem) => record.id}
                pagination={pagination}
            />
        </Card>
    );
}