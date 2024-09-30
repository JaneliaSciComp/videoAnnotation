import React, { useEffect, useState, useRef } from 'react';
import { Table, Button } from 'antd';
import { DeleteOutlined} from '@ant-design/icons';
import { useStates, useStateSetters } from './AppContext';
import { deleteAnnotation } from '../utils/requests';


/**
 * props:
 *      width: str or number. 200 or '200'. Width of the table
 *      height: str or number. 200 or '200'. Height of the table
 *      scrollY: str or number. 200 or '200'. Height of the contents part (excluding header row) of table
 *      size: 'small'/'middle'/'large'. default is 'small'
 *      ellipsis: boolean. Whether to make columns ellipsis when text is too long.
 * 
 * 
 */

export default function AnnotationTable(props) {
    
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [keysInTable, setKeysInTable] = useState([]);
    const [expandableConfig, setExpandableConfig] = useState([]);

    const frameUrlRef = useRef();
    const prevUploaderRef = useRef();
    const [info, setInfo] = useState();

    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const frameUrl = useStates().frameUrl;
    const setAnnoIdToDelete = useStateSetters().setAnnoIdToDelete;
    const setAnnoIdToShow = useStateSetters().setAnnoIdToShow;
    const annoIdToDraw = useStates().annoIdToDraw;
    const uploader = useStates().uploader;
    const setRemoveSingleCategory = useStateSetters().setRemoveSingleCategory;
    const singleCategoriesRef = useStates().singleCategoriesRef;

    useEffect(() => {
        if (!frameAnnotation) {
            setTableData([]);
            return
        };
        let data;
        if (frameUrl !== frameUrlRef.current || uploader !== prevUploaderRef.current) {
            data = Object.entries(frameAnnotation).map(
                ([id, annoObj]) => {
                    return {
                        key: id,
                        label: annoObj.label,
                        type: annoObj.type,
                        data: JSON.stringify(annoObj.data),
                    }
                }
            )
            setSelectedRowKeys(data.map(obj => obj.key));
            setKeysInTable(data.map(obj => obj.key));

            frameUrlRef.current = frameUrl;
            prevUploaderRef.current = uploader;
        
        } else {
            data = [...tableData];
            const newFrameKeys = Object.keys(frameAnnotation);
            const newFrameKeysSet = new Set(newFrameKeys);
            const frameKeys = tableData.map(obj => obj.key);
            const frameKeysSet = new Set(frameKeys);
            let newSelectedKeys;
            let newKeysInTable;
            if (newFrameKeys.length > frameKeys.length) {
                const idAdded = newFrameKeys.filter(key => !frameKeysSet.has(key))[0];
                data.push({
                    key: idAdded,
                    label: frameAnnotation[idAdded].label,
                    type: frameAnnotation[idAdded].type,
                });
                newSelectedKeys = [...selectedRowKeys];
                newSelectedKeys.push(idAdded);
                newKeysInTable = [...keysInTable];
                newKeysInTable.push(idAdded);
                
            } else if (newFrameKeys.length < frameKeys.length) {
                const idDeleted = frameKeys.filter(key => !newFrameKeysSet.has(key))[0];
                data = data.filter(obj => obj.key != idDeleted);
                newSelectedKeys = selectedRowKeys.filter(key => key!==idDeleted);
                newKeysInTable = keysInTable.filter(key => key!==idDeleted);
            } else { 
                const idAdded = newFrameKeys.filter(key => !frameKeysSet.has(key))[0];
                const idDeleted = frameKeys.filter(key => !newFrameKeysSet.has(key))[0];
                if (idAdded && idDeleted) {
                    data.push({
                        key: idAdded,
                        label: frameAnnotation[idAdded].label,
                        type: frameAnnotation[idAdded].type,
                    });
                    data = data.filter(obj => obj.key != idDeleted);
                    newSelectedKeys = [...selectedRowKeys];
                    newSelectedKeys.push(idAdded);
                    newSelectedKeys = newSelectedKeys.filter(key => key!==idDeleted);
                    newKeysInTable = [...keysInTable];
                    newKeysInTable.push(idAdded);
                    newKeysInTable = newKeysInTable.filter(key => key!==idDeleted);
                } else {
                    newSelectedKeys = selectedRowKeys;
                    newKeysInTable = keysInTable;
                }
            }
            data = data.map(obj => { return {...obj, data: JSON.stringify(frameAnnotation[obj.key]?.data)}});
            setSelectedRowKeys(newSelectedKeys);
            setKeysInTable(newKeysInTable);
        }
        setTableData(data);

        const labels = new Set();
        const types = new Set();
        Object.entries(frameAnnotation).forEach(
            ([_, annoObj]) => {
                labels.add(annoObj.label);
                types.add(annoObj.type);
            }
        )
        const labelFilters = [];
        labels.forEach((value1, value2, _) => {
            labelFilters.push(
                {
                    text: value1,
                    value: value2
                }
            )
        });
        const typeFilters = [];
        types.forEach((value1, value2, _) => {
            typeFilters.push(
                {
                    text: value1,
                    value: value2
                }
            )
        });

        const col = [
            {
                title: 'Label',
                dataIndex: 'label',
                filters: labelFilters,
                onFilter: (value, record) => record.label === value ,
                sorter: (a, b) => a.label.localeCompare(b.label),
                ellipsis: props.ellipsis
            },
            {
                title: 'Type',
                dataIndex: 'type',
                filters: typeFilters,
                onFilter: (value, record) => record.type === value ,
                sorter: (a, b) => a.label.localeCompare(b.label),
                ellipsis: props.ellipsis
            },
            {
                title: 'Delete',
                dataIndex: '',
                key: 'x',
                render: (_, record) => <Button  
                                        type='text'
                                        icon={<DeleteOutlined />} 
                                        onClick={()=>onDelete(record.key)}
                                        />,
                },
        ]
        setColumns(col);

        setExpandableConfig({
            expandedRowRender: (record) => <p style={{margin: '0', maxHeight: '6em', overflowY: 'auto'}}>{record.data}</p>,
            rowExpandable: (record) => record.data,
        });

        setInfo(null);
    }, [frameAnnotation, annoIdToDraw])


    useEffect(() => {
        const selectedKeysSet = new Set(selectedRowKeys);
        const res = keysInTable.filter(key => selectedKeysSet.has(key) && frameAnnotation[key]?.type !== 'category');
        setAnnoIdToShow(res);
    }, [keysInTable])

    useEffect(() => {
        const selectedKeysSet = new Set(selectedRowKeys);
        const res = keysInTable.filter(k => selectedKeysSet.has(k) && frameAnnotation[k]?.type !== 'category');
        setAnnoIdToShow(res);
    }, [selectedRowKeys])


    function onSelectChange(newSelectedRowKeys) {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    function onChange(pagination, filters, sorter, extra){
        const keptKeys = extra.currentDataSource.map(item => item.key);
        setKeysInTable(keptKeys);
    }

    async function onDelete(id) {
        /**
         * Use another state annoIdToDelete instead of letting Canvas use useEffect (frameAnnotation) to delete the fabric obj,
         * because the delete func in useEffect may be triggered by other actions,
         * so just use annoIdToDelete to trigger deleting on Canvas 
         * 
         * setRemoveSingleCategory to tell annotationChart to remove the category from the annotationForChart
         */
        if (id !== annoIdToDraw) {
            console.log('onDelete called');
            const res = await deleteAnnotation(id);
            if (res['error']) {
                setInfo(res['error']);
            } else if (res['success'] || res['info']==='annotation not found') {
                const frameAnnoCopy = {...frameAnnotation};
                const deletedCategory = {...frameAnnoCopy[id]};
                delete(frameAnnoCopy[id]);
                setFrameAnnotation(frameAnnoCopy);
                if (frameAnnotation[id].type !== 'category') {
                    setAnnoIdToDelete(id);
                } else {
                    setRemoveSingleCategory(deletedCategory);
                    if (singleCategoriesRef.current[deletedCategory.frameNum]) {
                        delete(singleCategoriesRef.current[deletedCategory.frameNum][id]);
                        console.log('annoTable delete singleCategory', singleCategoriesRef.current);
                    }
                }
            }
        }
    
}

    return (
        <div style={{width: `${props.width}px`, height: `${props.height}px`}}>
            <Table 
                size = {props.size ? props.size : 'small'}
                rowSelection={rowSelection} 
                columns={columns} 
                dataSource={tableData} 
                pagination={false}
                onChange={onChange}
                scroll={{y: props.scrollY, scrollToFirstRowOnChange: true}}
                expandable={expandableConfig}
                />
            <p>{info}</p>
        </div>
        
    )
    

}
