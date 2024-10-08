import React from 'react';
import { useStates } from './AppContext';

export default function BtnContainer() {
    const btns = useStates().btnGroups;

    return (
        <div className='my-3'>
            {btns}
        </div>
    )
}
