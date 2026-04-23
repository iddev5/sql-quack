"use client";
import { useState, useCallback } from "react";

import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

export default function Home() {
  const [value, setValue] = useState("SELECT 1");
  const onChange = useCallback((val, viewUpdate) => {
    console.log('val:', val);
    setValue(val);
  }, []);

  const runQuery = async () => {
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: 'sqlite', query: value })
      });

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div>
      <div className="h-[5vh] bg-gray-100">
      </div>
      <CodeMirror value={value} height="55vh" extensions={[sql()]} onChange={onChange} />
      <div className="w-full h-[30vh] border-4 border-gray-200">
        {/* <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact</th>
          </tr>

            <tr>
              <td>ID</td>
              <td>Name</td>
              <td>Contact</td>
            </tr>
        </table> */}
      </div>
      <div className="flex justify-end items-center h-[10vh] p-4">
        <button className="bg-blue-400 hover:bg-blue-300 py-2 px-4 rounded-lg text-md" onClick={runQuery}>Run Query</button>
      </div>
    </div>
  );
}
