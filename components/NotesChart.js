import { useStates } from './AppContext'; 
import { Table } from 'antd';

export default function NotesChart({notes}){
    const activeAnnoObj = useStates().activeAnnoObj;

    const columns = [
        {
          title: "Frame",
          dataIndex: "frameNumber",
          key: "frameNumber",
          render: (text) => <a>{text}</a> // need to link this to the given frame
        },
        {
          title: "Note",
          dataIndex: "note",
          key: "note",
          render: (text) => <a>{text}</a>
        }
      ] 

      const dataSource = Object.entries(notes).map(([key, note]) => ({
        key: parseInt(key), 
        frameNumber: parseInt(key, 10)+1,
        note
      }));

    return (
        <>
            <Table dataSource={dataSource} columns={columns}>Notes Table</Table>
        </>
    )
}
