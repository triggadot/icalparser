'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export function ApiDocumentation() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/calendar',
      description: 'List all calendar events',
      auth: 'API Key (read)',
      parameters: [
        { name: 'start_date', type: 'string', required: false, description: 'Filter events after this date (ISO 8601)' },
        { name: 'end_date', type: 'string', required: false, description: 'Filter events before this date (ISO 8601)' },
        { name: 'limit', type: 'number', required: false, description: 'Maximum number of events to return' },
      ],
      response: {
        success: {
          code: 200,
          example: `{
  "events": [
    {
      "id": "uuid",
      "title": "Event Title",
      "start_date": "2024-03-20",
      "end_date": "2024-03-21",
      "description": "Event description"
    }
  ]
}`,
        },
        error: {
          code: 401,
          example: `{
  "error": "Invalid API key"
}`,
        },
      },
    },
    {
      method: 'POST',
      path: '/api/calendar',
      description: 'Create a new calendar event',
      auth: 'API Key (write)',
      parameters: [
        { name: 'title', type: 'string', required: true, description: 'Event title' },
        { name: 'start_date', type: 'string', required: true, description: 'Event start date (ISO 8601)' },
        { name: 'end_date', type: 'string', required: true, description: 'Event end date (ISO 8601)' },
        { name: 'description', type: 'string', required: false, description: 'Event description' },
      ],
      response: {
        success: {
          code: 201,
          example: `{
  "event": {
    "id": "uuid",
    "title": "Event Title",
    "start_date": "2024-03-20",
    "end_date": "2024-03-21",
    "description": "Event description"
  }
}`,
        },
        error: {
          code: 400,
          example: `{
  "error": "Invalid request body"
}`,
        },
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h2 className="text-lg font-semibold mt-0">Authentication</h2>
            <p>
              All API requests require an API key to be included in the request headers:
            </p>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
              <code>X-API-Key: your_api_key_here</code>
            </pre>

            <h2 className="text-lg font-semibold">Rate Limiting</h2>
            <p>
              API requests are limited to 1000 requests per hour by default. You can monitor your usage in the API Usage Dashboard.
            </p>

            <h2 className="text-lg font-semibold">Endpoints</h2>
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm">{endpoint.path}</code>
                  </div>
                  <p className="text-muted-foreground mb-4">{endpoint.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Authentication Required</h4>
                    <Badge variant="outline">{endpoint.auth}</Badge>
                  </div>

                  {endpoint.parameters.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Parameters</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Name</th>
                            <th className="text-left py-2">Type</th>
                            <th className="text-left py-2">Required</th>
                            <th className="text-left py-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.parameters.map((param, paramIndex) => (
                            <tr key={paramIndex} className="border-b">
                              <td className="py-2">{param.name}</td>
                              <td className="py-2">{param.type}</td>
                              <td className="py-2">
                                {param.required ? (
                                  <Badge>Required</Badge>
                                ) : (
                                  <Badge variant="secondary">Optional</Badge>
                                )}
                              </td>
                              <td className="py-2">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Response</h4>
                    <Tabs defaultValue="success">
                      <TabsList>
                        <TabsTrigger value="success">Success ({endpoint.response.success.code})</TabsTrigger>
                        <TabsTrigger value="error">Error ({endpoint.response.error.code})</TabsTrigger>
                      </TabsList>
                      <TabsContent value="success">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <code>{endpoint.response.success.example}</code>
                        </pre>
                      </TabsContent>
                      <TabsContent value="error">
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                          <code>{endpoint.response.error.example}</code>
                        </pre>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 