import React from 'react';
import { useApp } from './AppContext';

export default function BtnContainer() {
    const btns = useApp().btnGroups;

    return (
        <div className='my-3'>
            {btns}
        </div>
    )
}
