import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyHandlerV2,
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerWithContextResult,
} from 'aws-lambda';

type AuthorizerContext = {
  reason: string;
};

export const handler: APIGatewayProxyHandlerV2 | ((
  event: APIGatewayRequestAuthorizerEventV2,
) => Promise<APIGatewaySimpleAuthorizerWithContextResult<AuthorizerContext>>) =
  async (
    event: APIGatewayProxyEventV2 | APIGatewayRequestAuthorizerEventV2,
  ) => {
    if ('type' in event && event.type === 'REQUEST') {
      const authorization = Object.entries(event.headers ?? {}).find(
        ([name]) => name.toLowerCase() === 'authorization',
      )?.[1];
      const allowed = authorization === 'allow';

      return {
        isAuthorized: allowed,
        context: {
          reason: allowed ? 'allowed' : 'denied',
        },
      };
    }

    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': 'http://localhost:5173',
      },
      body: JSON.stringify({ ok: true }),
    };
  };
