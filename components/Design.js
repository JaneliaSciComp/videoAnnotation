import React, {useState, useEffect, useRef, Fragment} from 'react';
import styles from '../styles/Controller.module.css';
import BtnGroupController from './BtnGroupController';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';



const BTNGROUPNUM_MAX=50

export default function Design(props) {

    return (
        <div className={styles.designContainer}>
            <p className='my-2'>Customize Annotation Buttons</p>
            <Space direction='vertical'>
                <BtnGroupController />
            </Space>
            <br />
            <Space className='my-3 d-flex justify-content-center' wrap>
                {/* icon={<PlusOutlined />} */}
                <Button >Add</Button>
                <Button type="primary">Create</Button>
            </Space>
        </div>
    )
}