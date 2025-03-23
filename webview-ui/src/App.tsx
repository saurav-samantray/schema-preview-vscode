import React, { useEffect, useState } from "react";
import { JsonSchemaViewer } from '@stoplight/json-schema-viewer';

declare function acquireVsCodeApi(): {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const App: React.FC = () => {
  const dummySchema: any = {
    "type": [
      "array"
    ],
    "minItems": 1,
    "maxItems": 10,
    "items": {
      "title": "User",
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "const": "Constant name",
          "examples": [
            "Example name",
            "Different name"
          ],
          "description": "The user's full name. This description can be long and should truncate once it reaches the end of the row. If it's not truncating then theres and issue that needs to be fixed. Help!"
        },
        "age": {
          "type": "number",
          "minimum": 10,
          "maximum": 40,
          "multipleOf": 10,
          "default": 20,
          "enum": [
            10,
            20,
            30,
            40
          ],
          "readOnly": true
        },
        "completed_at": {
          "type": "string",
          "format": "date-time",
          "writeOnly": true,
          "pattern": "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
        },
        "items": {
          "type": [
            "null",
            "array"
          ],
          "items": {
            "type": [
              "string",
              "number"
            ]
          },
          "minItems": 1,
          "maxItems": 4,
          "description": "This description can be long and should truncate once it reaches the end of the row. If it's not truncating then theres and issue that needs to be fixed. Help!"
        },
        "email": {
          "type": "string",
          "format": "email",
          "examples": [
            "one@email.com",
            "two@email.com"
          ],
          "deprecated": true,
          "default": "default@email.com",
          "minLength": 2
        },
        "plan": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "foo": {
                  "type": "string"
                },
                "bar": {
                  "type": "string"
                }
              },
              "deprecated": false,
              "example": "hi",
              "required": [
                "foo",
                "bar"
              ]
            },
            {
              "type": "array",
              "items": {
                "type": "integer"
              }
            }
          ]
        },
        "permissions": {
          "type": [
            "string",
            "object"
          ],
          "properties": {
            "ids": {
              "type": "array",
              "items": {
                "type": "integer"
              }
            }
          }
        },
        "ref": {
          "$ref": "#/properties/permissions"
        }
      },
      "patternProperties": {
        "^id_": {
          "type": "number"
        },
        "foo": {
          "type": "integer"
        },
        "_name$": {
          "type": "string"
        }
      },
      "required": [
        "name",
        "age",
        "completed_at"
      ]
    }
  };
  const [jsonSchema, setJsonSchema] = useState<any>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Default effect. Adding windows listener");
    const vscode = acquireVsCodeApi();
    console.log(`vscode: ${JSON.stringify(vscode)}`);

    window.addEventListener('message', event => {
      const message = event.data;
      console.log(`New message in webview: ${JSON.stringify(message)}`);
      switch (message.type) {
        case 'fileContent':
          setJsonSchema(JSON.parse(message.data));
          setIsLoading(false);
          break;
      }
    });

    vscode.postMessage({ type: 'ready' });
  }, []);

  // useEffect(() => {
  //   if (filePath) {
  //     setIsLoading(true);
  //     fetch(`vscode-resource://${filePath}`)
  //       .then(response => response.json())
  //       .then(data => {
  //         console.log(`Json schema data : ${JSON.stringify(data)}`);
  //         setJsonSchema(data);
  //         setIsLoading(false);
  //       })
  //       .catch(error => {
  //         console.error('Error fetching JSON schema:', error);
  //         setIsLoading(false);
  //       });
  //   }
  // }, [filePath]);

  return (
    <div className="sl-p-2">
        {isLoading ? (
          <div className="sl-text-base">
            Loading content
          </div>
        ) : jsonSchema ? (
          <JsonSchemaViewer schema={jsonSchema} />
        ) : (
          <p>No schema loaded.</p>
        )}
    </div>
  );
};

export default App;
