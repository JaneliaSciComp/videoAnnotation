import React, { useEffect, useState, useRef } from 'react';
import { Table, Button } from 'antd';
import { DeleteOutlined} from '@ant-design/icons';
import { useStates, useStateSetters } from './AppContext';
// import styles from '../styles/Controller.module.css';


export default function AnnotationTable(props) {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentKeys, setCurrentKeys] = useState([]);
    // const currentKeysRef = useRef([]);

    // context
    const frameAnnotation = useStates().frameAnnotation;
    const setFrameAnnotation = useStateSetters().setFrameAnnotation;
    const setAnnoIdToDelete = useStateSetters().setAnnoIdToDelete;
    const setAnnoIdToShow = useStateSetters().setAnnoIdToShow;
    const annoIdToDraw = useStates().annoIdToDraw;
   

    useEffect(() => {
        // if (Object.entries(frameAnnotation).length > 0) {
            // console.log('annoTable useEffect', frameAnnotation);
            // construct data source
            const data = Object.entries(frameAnnotation).map(
                ([id, annoObj]) => {
                    return {
                        key: id,
                        label: annoObj.label,
                        type: annoObj.type,
                    }
                }
            )
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
                },
                {
                    title: 'Type',
                    dataIndex: 'type',
                    filters: typeFilters,
                    onFilter: (value, record) => record.type === value ,
                    sorter: (a, b) => a.label.localeCompare(b.label),
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
        // }
    }, [frameAnnotation])

    function onDelete(id) {
        /**
         * Use another state annoIdToDelete instead of letting Canvas use useEffect (frameAnnotation) to delete the fabric obj,
         * because the delete func in useEffect may be triggered by other actions,
         * so just use annoIdToDelete to trigger deleting on Canvas 
         */
        console.log('onDelete called');
        if (id !== annoIdToDraw) { // if in the process of drawing an obj, cannot delete it
            setAnnoIdToDelete(id);
            const frameAnnoCopy = {...frameAnnotation};
            delete(frameAnnoCopy[id]);
            setFrameAnnotation(frameAnnoCopy);
        }
        
    }

    useEffect(() => {
        console.log('currentKeysRef useEffect', currentKeys);
        // let res = [];
        // if (currentKeys.length > 0) {
        //     const selectedKeysSet = new Set(selectedRowKeys);
        //     res = currentKeys.filter(k => selectedKeysSet.has(k));
        // }
        // setAnnoIdToShow(res);
        setAnnoIdToShow(currentKeys);
    }, [currentKeys])


    function onSelectChange(newSelectedRowKeys) {
        console.log('selectedRowKeys changed: ', newSelectedRowKeys, currentKeys);

        setSelectedRowKeys(newSelectedRowKeys);

        let res = [];
        if (currentKeys.length > 0) {
            const selectedKeysSet = new Set(newSelectedRowKeys);
            res = currentKeys.filter(k => selectedKeysSet.has(k));
        }
        setAnnoIdToShow(res);
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
        console.log('onChange', extra.currentDataSource);
        const keptKeys = extra.currentDataSource.map(item => item.key);
        setCurrentKeys(keptKeys);
        // currentKeysRef.current = keptKeys;
   } 

    return (
        <Table 
            size = 'small'
            rowSelection={rowSelection} 
            columns={columns} 
            dataSource={tableData} 
            pagination={false}
            onChange={onChange}
            />
    )
    

}
