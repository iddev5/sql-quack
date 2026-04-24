"use client";
import { useState, useCallback } from "react";

import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

export default function Home() {
  const [schema, setSchema] = useState("CREATE TABLE table_name (x INT);\n\nINSERT INTO table_name VALUES (1), (2);");
  const [query, setQuery] = useState("SELECT * FROM table_name");

  const [result, setResult] = useState(null);

  const onSchemaChange = useCallback((val, viewUpdate) => {
    setSchema(val);
  }, []);

  const onQueryChange = useCallback((val, viewUpdate) => {
    setQuery(val);
  }, []);

  const runQuery = async () => {
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: 'sqlite', schema: schema, query: query })
      });

      const data = await res.json();
      if (data.error !== undefined)
        console.error(data.error);
      setResult(data);
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div>
      <div className="h-[5vh] bg-gray-100">
      </div>
      <div className="flex w-full">
        <CodeMirror value={schema} className="w-[50%]" height="55vh" extensions={[sql()]} onChange={onSchemaChange} />
        <CodeMirror value={query} className="w-[50%]" height="55vh" extensions={[sql()]} onChange={onQueryChange} />
      </div>
      <div className="flex justify-end items-center h-[10vh] p-4">
        <button className="bg-blue-400 hover:bg-blue-300 py-2 px-4 rounded-lg text-md" onClick={runQuery}>Run Query</button>
      </div>
      <div className="w-full h-[30vh] overflow-auto border-4 border-gray-200">
        {result && result.error !== undefined &&
          <p className="text-red-500">{result.error}</p>
        }
        {result && result.error === undefined &&
          <table>
            <thead>
              <tr className="border-b-1 border-gray-900">
                {result.columns.map(col => (
                  <th key={col} className="px-3 py-4 text-left text-sm sticky top-0 bg-white">
                    {col.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => (
                <tr key={i} className="border-b-1 border-gray-900">
                  {result.columns.map(col => (
                    <td key={col}
                      className={`px-2 py-4
                          ${
                            typeof row[col] === "number" ? "text-indigo-400"
                            : "text-gray-600"
                          }

                          ${
                            row[col] === null ? "italic" : "not-italic"
                          }
                        `}
                      >
                      {row[col] === null ? "NULL" : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
