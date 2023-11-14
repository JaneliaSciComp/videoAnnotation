import React, { useEffect, useState, useRef } from 'react';
import { Table, Button } from 'antd';
import { DeleteOutlined} from '@ant-design/icons';
import { useStates, useStateSetters } from './AppContext';
// import styles from '../styles/Controller.module.css';


export default function AnnotationTable(props) {
    /**
     * props:
     *      //width: str or number. 200 or '20em'. Width of the content part table
     *      height: str or number. 200 or '20em'. Height of the content part of table
     *      size: 'small'/'middle'/'large'. default is 'small'
     *      ellipsis: boolean. Whether to make columns ellipsis when text is too long.
     * 
     * 
     */

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [keysInTable, setKeysInTable] = useState([]); // changes when selection and filter
    const [expandableConfig, setExpandableConfig] = useState([]);

    const frameUrlRef = useRef();

    // context
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const frameUrl = useStates().frameUrl;
    const setAnnoIdToDelete = useStateSetters().setAnnoIdToDelete;
    // const annoIdToShow = useStates().annoIdToShow;
    const setAnnoIdToShow = useStateSetters().setAnnoIdToShow; // to pass data to canvas according to currentKeys
    const annoIdToDraw = useStates().annoIdToDraw;



    useEffect(() => {
        console.log('annoTable useEffect', frameAnnotation, tableData, frameUrl, frameUrlRef.current);
        let data;
        if (frameUrl !== frameUrlRef.current) { // when switch frame
            // console.log('if called');
            // construct data source
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
        
        } else { // when add or delete annoObj
            // console.log('else called');
            data = [...tableData];
            const newFrameKeys = Object.keys(frameAnnotation);
            const newFrameKeysSet = new Set(newFrameKeys);
            const frameKeys = tableData.map(obj => obj.key);
            const frameKeysSet = new Set(frameKeys);
            let newSelectedKeys;
            let newKeysInTable;
            if (newFrameKeys.length > frameKeys.length) { // added annoObj
                const idAdded = newFrameKeys.filter(key => !frameKeysSet.has(key))[0];
                // console.log('idadded', idAdded, !frameKeysSet.has(idAdded), frameKeysSet, newFrameKeysSet);
                data.push({
                    key: idAdded,
                    label: frameAnnotation[idAdded].label,
                    type: frameAnnotation[idAdded].type,
                });
                newSelectedKeys = [...selectedRowKeys];
                newSelectedKeys.push(idAdded);
                newKeysInTable = [...keysInTable];
                newKeysInTable.push(idAdded);
                
            } else if (newFrameKeys.length < frameKeys.length) { // deleted annoObj
                const idDeleted = frameKeys.filter(key => !newFrameKeysSet.has(key))[0];
                // console.log('idDeleted', idDeleted, !newFrameKeysSet.has(idDeleted), tableData, frameAnnotation);
                data = data.filter(obj => obj.key != idDeleted);
                console.log(data);
                newSelectedKeys = selectedRowKeys.filter(key => key!==idDeleted);
                newKeysInTable = keysInTable.filter(key => key!==idDeleted);
            } else { 
                // 1. other modification on frameAnno or annoIdToDraw (canvas or annoBtn)
                // 2. when clearUnfinishedAnnoObj() and create new AnnoObj happen
                //    clearUnfinishedAnnoObj() can only remove one annoObj when create one new, 
                //    so the other two conditions (>,<) won't happen
                const idAdded = newFrameKeys.filter(key => !frameKeysSet.has(key))[0];
                const idDeleted = frameKeys.filter(key => !newFrameKeysSet.has(key))[0];
                if (idAdded && idDeleted) { // 2
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
                } else { // 1
                    newSelectedKeys = selectedRowKeys;
                    newKeysInTable = keysInTable;
                }
                console.log(data);
            }
            data = data.map(obj => { return {...obj, data: JSON.stringify(frameAnnotation[obj.key]?.data)}});
            setSelectedRowKeys(newSelectedKeys);
            setKeysInTable(newKeysInTable);
        }
        setTableData(data);

        // construct columns and filters, sorters
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
                                        // shape='circle'
                                        type='text'
                                        icon={<DeleteOutlined />} 
                                        onClick={()=>onDelete(record.key)}
                                        // size='small'
                                        />,
                },
        ]
        setColumns(col);

        // config expandable
        setExpandableConfig({
            expandedRowRender: (record) => <p style={{margin: '0', maxHeight: '6em', overflowY: 'auto'}}>{record.data}</p>,
            rowExpandable: (record) => record.data,
        });
    }, [frameAnnotation, annoIdToDraw])


    useEffect(() => {
        // console.log('keysInTable useEffect', keysInTable);
        const selectedKeysSet = new Set(selectedRowKeys);
        const res = keysInTable.filter(key => selectedKeysSet.has(key) && frameAnnotation[key].type !== 'category');
        setAnnoIdToShow(res);
    }, [keysInTable])

    useEffect(() => {
        // console.log('selectedRowKeys useEffect', selectedRowKeys);
        const selectedKeysSet = new Set(selectedRowKeys);
        const res = keysInTable.filter(k => selectedKeysSet.has(k) && frameAnnotation[k].type !== 'category');
        setAnnoIdToShow(res);
    }, [selectedRowKeys])


    function onSelectChange(newSelectedRowKeys) {
        // console.log('selectedRowKeys changed: ', newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
        // selections: [
        //     Table.SELECTION_ALL,
        //     Table.SELECTION_INVERT,
        //     Table.SELECTION_NONE,
        // ],
    };

    function onChange(pagination, filters, sorter, extra){
        // console.log('onChange', extra.currentDataSource);
        const keptKeys = extra.currentDataSource.map(item => item.key);
        setKeysInTable(keptKeys);
    }

    function onDelete(id) {
        /**
         * Use another state annoIdToDelete instead of letting Canvas use useEffect (frameAnnotation) to delete the fabric obj,
         * because the delete func in useEffect may be triggered by other actions,
         * so just use annoIdToDelete to trigger deleting on Canvas 
         */
        if (id !== annoIdToDraw) { // if in the process of drawing an obj, cannot delete it
            console.log('onDelete called');
            const frameAnnoCopy = {...frameAnnotation};
            delete(frameAnnoCopy[id]);
            setFrameAnnotation(frameAnnoCopy);
            if (frameAnnotation[id].type !== 'category') {
                setAnnoIdToDelete(id);
            }
        }
    
}

    return (
        <Table 
            size = {props.size ? props.size : 'small'}
            rowSelection={rowSelection} 
            columns={columns} 
            dataSource={tableData} 
            pagination={false}
            onChange={onChange}
            scroll={{y: props.height, scrollToFirstRowOnChange: true}}
            expandable={expandableConfig}
            />
    )
    

}
