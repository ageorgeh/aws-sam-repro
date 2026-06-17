import * as path from 'path';
import { Stack, StackProps } from 'aws-cdk-lib';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

export class ReproStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handler = new NodejsFunction(this, 'Handler', {
      entry: path.join(__dirname, '../lambda/handler.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_20_X,
    });

    const authorizer = new HttpLambdaAuthorizer('Authorizer', handler, {
      responseTypes: [HttpLambdaResponseType.SIMPLE],
    });

    const api = new HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowOrigins: ['http://localhost:5173'],
        allowMethods: [CorsHttpMethod.GET ],
        allowHeaders: ['authorization', 'content-type'],
      },
    });

    api.addRoutes({
      path: '/hello',
      methods: [HttpMethod.GET],
      authorizer,
      integration: new HttpLambdaIntegration('Integration', handler),
    });
  }
}
