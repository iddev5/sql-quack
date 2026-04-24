"use client";
import { useState, useCallback } from "react";

import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

const default_schemas = {
  'schema-blank': '-- enter code here',

  'schema-users': `
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  age INTEGER
);

INSERT INTO users VALUES
  (1, 'Alice Johnson', 'alice@example.com', 28),
  (2, 'Bob Smith',    'bob@example.com',   34),
  (3, 'Carol White',  'carol@example.com', 25);
  `,
};

export default function Home() {
  const [schema, setSchema] = useState("CREATE TABLE table_name (x INT);\n\nINSERT INTO table_name VALUES (1), (2);");
  const [query, setQuery] = useState("SELECT * FROM table_name");

  const [result, setResult] = useState(null);

  const onSchemaSelect = (e) => {
    const schema_name = e.target.value;
    setSchema(default_schemas[schema_name].trim() ?? '')
  };

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
        <div className="w-[50%]" >
          <label htmlFor="schema">Schema Preset</label>
          <select id="schema" name="schema" onChange={onSchemaSelect}>
            <option value="schema-blank">Blank</option>
            <option value="schema-users">Users</option>
          </select>
          <CodeMirror value={schema} height="55vh" extensions={[sql()]} onChange={onSchemaChange} />
        </div>
        <div className="w-[50%]">
          <p>&nbsp;</p>
          <CodeMirror value={query}  height="55vh" extensions={[sql()]} onChange={onQueryChange} />
        </div>
      </div>
      <div className="flex justify-end items-center h-[7vh] p-4">
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
